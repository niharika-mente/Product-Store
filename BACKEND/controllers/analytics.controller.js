import PDFDocument from 'pdfkit';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getSummary = async (req, res) => {
  try {
    const [revenueResult, totalOrders, totalUsers, totalProducts] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ paymentStatus: 'completed' }),
      User.countDocuments(),
      Product.countDocuments({ isDeleted: { $ne: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: revenueResult[0]?.total ?? 0,
        totalOrders,
        totalUsers,
        totalProducts,
      },
    });
  } catch (err) {
    console.error('[Analytics] Summary error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const since = monthsAgo(5);
    const rows = await Order.aggregate([
      { $match: { paymentStatus: 'completed', createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const data = rows.map(r => ({
      month: `${MONTHS[r._id.month - 1]} ${r._id.year}`,
      revenue: r.revenue,
      orders: r.orders,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('[Analytics] Revenue error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue data' });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const rows = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Analytics] Top products error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch top products' });
  }
};

export const getUserGrowth = async (req, res) => {
  try {
    const since = monthsAgo(5);
    const rows = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const data = rows.map(r => ({
      month: `${MONTHS[r._id.month - 1]} ${r._id.year}`,
      newUsers: r.newUsers,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('[Analytics] User growth error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user growth' });
  }
};

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Parse an optional YYYY-MM-DD (or ISO) query value into a Date. `endOfDay`
// extends a bare calendar date to 23:59:59.999 so date ranges are inclusive.
// Returns { date } on success, { error } on an unparseable value, or {} when absent.
function parseDateParam(value, { endOfDay = false } = {}) {
  if (value === undefined || value === '') return {};
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { error: true };
  if (endOfDay && date.getHours() === 0 && date.getMinutes() === 0 &&
      date.getSeconds() === 0 && date.getMilliseconds() === 0) {
    date.setHours(23, 59, 59, 999);
  }
  return { date };
}

const csvEscape = (value) => {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function buildCsvReport(summary, rows) {
  const lines = [
    'Admin Analytics Report',
    `Date Range,${csvEscape(summary.startDate)} to ${csvEscape(summary.endDate)}`,
    '',
    'Summary',
    'Metric,Value',
    `Total Revenue,${summary.totalRevenue}`,
    `Total Orders,${summary.totalOrders}`,
    `Total Items Sold,${summary.totalItemsSold}`,
    `Average Order Value,${summary.averageOrderValue}`,
    `New Users,${summary.newUsers}`,
    `Active Users,${summary.activeUsers}`,
    '',
    'Daily Breakdown',
    'Date,Orders,Revenue,Items Sold',
  ];
  for (const r of rows) {
    lines.push([csvEscape(r.date), r.orders, r.revenue, r.itemsSold].join(','));
  }
  if (rows.length === 0) lines.push('No orders in the selected range,,,');
  return lines.join('\r\n');
}

function buildPdfReport(summary, rows) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Admin Analytics Report', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(11).fillColor('#555555')
      .text(`Date Range: ${summary.startDate} to ${summary.endDate}`, { align: 'center' });
    doc.fillColor('#000000').moveDown(1.2);

    doc.fontSize(14).text('Summary');
    doc.moveDown(0.4).fontSize(11);
    [
      ['Total Revenue', summary.totalRevenue],
      ['Total Orders', summary.totalOrders],
      ['Total Items Sold', summary.totalItemsSold],
      ['Average Order Value', summary.averageOrderValue],
      ['New Users', summary.newUsers],
      ['Active Users', summary.activeUsers],
    ].forEach(([label, value]) => doc.text(`${label}: ${value}`));
    doc.moveDown(1.2);

    doc.fontSize(14).text('Daily Breakdown');
    doc.moveDown(0.4).fontSize(11);

    const cols = [50, 200, 300, 420];
    const headers = ['Date', 'Orders', 'Revenue', 'Items Sold'];
    const drawRow = (cells, font) => {
      const y = doc.y;
      doc.font(font);
      cells.forEach((cell, i) => doc.text(String(cell), cols[i], y));
      doc.font('Helvetica');
    };

    if (rows.length === 0) {
      doc.text('No orders in the selected range.');
    } else {
      drawRow(headers, 'Helvetica-Bold');
      doc.moveDown(0.2);
      rows.forEach((r) => {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 20) doc.addPage();
        drawRow([r.date, r.orders, r.revenue, r.itemsSold], 'Helvetica');
      });
    }

    doc.end();
  });
}

// @desc    Export sales, revenue and active-user metrics over a date range
//          as a downloadable CSV or PDF report.
// @route   GET /api/admin/analytics/export?startDate=&endDate=&format=csv|pdf
export const exportAnalytics = async (req, res) => {
  try {
    const format = String(req.query.format || 'csv').toLowerCase();
    if (format !== 'csv' && format !== 'pdf') {
      return res.status(400).json({ success: false, message: "Invalid format. Use 'csv' or 'pdf'." });
    }

    const start = parseDateParam(req.query.startDate);
    const end = parseDateParam(req.query.endDate, { endOfDay: true });
    if (start.error) return res.status(400).json({ success: false, message: 'Invalid startDate.' });
    if (end.error) return res.status(400).json({ success: false, message: 'Invalid endDate.' });
    if (start.date && end.date && start.date > end.date) {
      return res.status(400).json({ success: false, message: 'startDate must not be after endDate.' });
    }

    const createdAt = {};
    if (start.date) createdAt.$gte = start.date;
    if (end.date) createdAt.$lte = end.date;
    const dateFilter = Object.keys(createdAt).length ? { createdAt } : {};
    const orderMatch = { paymentStatus: 'completed', ...dateFilter };

    const itemsSold = { $sum: { $sum: '$items.quantity' } };
    const [daily, totalsAgg, activeUsers, newUsers] = await Promise.all([
      Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
            itemsSold,
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: orderMatch },
        { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$totalAmount' }, itemsSold } },
      ]),
      Order.distinct('user', { ...orderMatch, user: { $ne: null } }),
      User.countDocuments(dateFilter),
    ]);

    const totals = totalsAgg[0] || { orders: 0, revenue: 0, itemsSold: 0 };
    const summary = {
      startDate: start.date ? start.date.toISOString().slice(0, 10) : 'all-time',
      endDate: end.date ? end.date.toISOString().slice(0, 10) : 'all-time',
      totalRevenue: round2(totals.revenue),
      totalOrders: totals.orders,
      totalItemsSold: totals.itemsSold || 0,
      averageOrderValue: totals.orders ? round2(totals.revenue / totals.orders) : 0,
      newUsers,
      activeUsers: activeUsers.length,
    };
    const rows = daily.map((d) => ({
      date: d._id,
      orders: d.orders,
      revenue: round2(d.revenue),
      itemsSold: d.itemsSold || 0,
    }));

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.csv"');
      return res.status(200).send(buildCsvReport(summary, rows));
    }

    const pdf = await buildPdfReport(summary, rows);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.pdf"');
    return res.status(200).send(pdf);
  } catch (err) {
    console.error('[Analytics] Export error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to export analytics report' });
  }
};
