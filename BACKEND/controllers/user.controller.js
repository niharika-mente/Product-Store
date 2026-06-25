import User from "../models/user.model.js";

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateProfile = async (req, res) => {
    const { name, phone, avatar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (avatar !== undefined) updates.avatar = avatar.trim();

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const addAddress = async (req, res) => {
    const { label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body;
    if (!fullName || !line1 || !city || !postalCode || !country) {
        return res.status(400).json({ success: false, message: "fullName, line1, city, postalCode and country are required" });
    }
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (isDefault) {
            user.addresses.forEach(a => { a.isDefault = false; });
        }
        user.addresses.push({ label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault: !!isDefault });
        await user.save();
        res.status(201).json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateAddress = async (req, res) => {
    const { addressId } = req.params;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const addr = user.addresses.id(addressId);
        if (!addr) return res.status(404).json({ success: false, message: "Address not found" });

        const fields = ["label", "fullName", "phone", "line1", "line2", "city", "state", "postalCode", "country"];
        fields.forEach(f => { if (req.body[f] !== undefined) addr[f] = req.body[f]; });

        if (req.body.isDefault) {
            user.addresses.forEach(a => { a.isDefault = false; });
            addr.isDefault = true;
        }

        await user.save();
        res.json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteAddress = async (req, res) => {
    const { addressId } = req.params;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const before = user.addresses.length;
        user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);
        if (user.addresses.length === before) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        await user.save();
        res.json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const setDefaultAddress = async (req, res) => {
    const { addressId } = req.params;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const addr = user.addresses.id(addressId);
        if (!addr) return res.status(404).json({ success: false, message: "Address not found" });

        user.addresses.forEach(a => { a.isDefault = false; });
        addr.isDefault = true;
        await user.save();
        res.json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
