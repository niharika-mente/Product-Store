import PDFDocument from 'pdfkit';

export const generateInvoice = (invoiceData, res) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: "A4" });

            res.setHeader("Content-Type", "application/pdf");
            const invoiceNumber = `INV-2026-${String(invoiceData.order._id).substring(0, 6).toUpperCase()}`;
            res.setHeader("Content-Disposition", `attachment; filename="${invoiceNumber}.pdf"`);

            doc.pipe(res);

            // Header
            doc.fontSize(20).text("SHOPMART", 50, 50);
            doc.fontSize(10).text("support@shopmart.com", 50, 75);
            doc.text("GSTIN: XXXXXXX", 50, 90);

            // Invoice Info
            doc.fontSize(12).text(`Invoice #: ${invoiceNumber}`, 400, 50, { align: "right" });
            doc.text(`Order #: ORD-${String(invoiceData.order._id).substring(0, 8).toUpperCase()}`, 400, 65, { align: "right" });
            const invoiceDate = new Date().toLocaleDateString('en-IN');
            const orderDate = new Date(invoiceData.order.createdAt).toLocaleDateString('en-IN');
            doc.text(`Date: ${invoiceDate}`, 400, 80, { align: "right" });
            doc.text(`Order Date: ${orderDate}`, 400, 95, { align: "right" });
            doc.text(`Payment: ${invoiceData.order.paymentStatus || 'Online'}`, 400, 110, { align: "right" });

            doc.moveDown(3);

            // Customer Info
            doc.fontSize(12).text("Billed To:", 50, doc.y);
            doc.text(invoiceData.user?.name || 'Customer');
            doc.text(invoiceData.user?.email || 'N/A');

            doc.moveDown(2);

            // Table Header
            let top = doc.y;
            doc.font("Helvetica-Bold");
            doc.text("Product", 50, top);
            doc.text("Quantity", 300, top);
            doc.text("Unit Price", 400, top);
            doc.text("Total", 500, top);

            doc.moveTo(50, top + 15).lineTo(550, top + 15).stroke();

            // Table Rows
            let currentY = top + 25;
            doc.font("Helvetica");
            
            let subtotal = 0;
            
            for (const item of invoiceData.order.items) {
                if (currentY > 650) {
                    doc.addPage();
                    currentY = 50;
                }
                const itemTotal = Number(item.quantity) * Number(item.price);
                subtotal += itemTotal;
                
                doc.text(item.name || 'Product', 50, currentY, { width: 240 });
                doc.text(item.quantity.toString(), 300, currentY);
                doc.text(`$${Number(item.price).toFixed(2)}`, 400, currentY);
                doc.text(`$${itemTotal.toFixed(2)}`, 500, currentY);
                currentY += 20;
            }

            doc.moveTo(50, currentY + 10).lineTo(550, currentY + 10).stroke();

            // Pricing Summary
            currentY += 30;
            if (currentY > 650) { 
                doc.addPage(); 
                currentY = 50; 
            }

            const total = Number(invoiceData.order.totalAmount);
            
            doc.text("Subtotal", 350, currentY);
            doc.text(`$${subtotal.toFixed(2)}`, 500, currentY);
            currentY += 20;

            doc.font("Helvetica-Bold");
            doc.text("Grand Total", 350, currentY);
            doc.text(`$${total.toFixed(2)}`, 500, currentY);
            
            // Footer
            doc.font("Helvetica");
            doc.text("Thank you for shopping with us.", 50, 700, { align: "center" });
            doc.fontSize(10).text("This is a computer-generated invoice and does not require a physical signature.", 50, 715, { align: "center" });

            doc.end();

            doc.on("end", () => {
                resolve();
            });
            doc.on("error", (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};
