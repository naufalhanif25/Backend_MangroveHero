const User = require("../models/User");

exports.addUser = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Email Anda Tidak Valid.",
            });
        }

        const userData = await User.findOne({ email });

        if (userData) {
            res.status(200).json({
                message: "Data pengguna sudah tersedia",
                status: 200,
                data: userData,
            });
        }
        else {
            const user = new User({ email });
            await user.save();

            res.status(200).json({
                message: "Berhasil menambahkan pengguna",
                status: 200,
                data: user,
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error: Gagal menambahkan pengguna",
            status: 500,
            error: error.message,
        });
    }
}

exports.getUser = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Email Anda Tidak Valid.",
            });
        }

        const user = await User.findOne({ email });

        const mangroveLength = user.purchases.filter(p => p.item === 0).length;
        const fertilizerLength = user.purchases.filter(p => p.item === 1).length;

        res.status(200).json({
            message: "Berhasil mengambil data pengguna",
            status: 200,
            data: {
                ...user.toObject(),
                mangroveLength,
                fertilizerLength,
            }
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error: Gagal mengambil data pengguna",
            status: 500,
            error: error.message,
        });
    }
}

exports.buyItems = async (req, res) => {
    try {
        const { email } = req.params;
        const { items } = req.body;

        if (items === undefined || ![0, 1].includes(items)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid Items: Pilih Salah Satu 0 (mangrove) atau 1 (pupuk).",
            });
        }

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Gagal menemukan email",
            });
        }

        const item = items === 0 ? "mangrove" : "pupuk";
        const cost = items === 0 ? 24 : 16;
        const tree = await User.findOne({ email });

        if (!tree) {
            return res.status(404).json({
                success: false,
                message: "User Email Tidak di temukan.",
            });
        }

        if (tree.totalCoins < cost) {
            return res.status(400).json({
                success: false,
                message: `Coin Anda Tidak Cukup. Butuh ${cost} untuk membeli ${item}, kamu hanya meiliki ${tree.totalCoins} tersisa.`,
            });
        }

        tree.totalCoins -= cost;
        tree.purchases.push({
            itemIndex: items,
            cost: cost,
            timestamp: new Date(),
        });

        await tree.save();

        const purchaseResult = {
            itemPurchased: item,
            email: email,
            coinsSpent: cost,
            remainingCoins: tree.totalCoins,
            timestamp: new Date(),
            status: "success",
        };

        return res.status(200).json({
            success: true,
            message: `Success: Beli ${item} for ${email}`,
            data: purchaseResult,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error: Gagal melakukan pembelian",
        });
    }
};

exports.getItems = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Email Anda Tidak Valid.",
            });
        }

        const tree = await User.findOne({ email });

        if (!tree) {
            return res.status(404).json({
                success: false,
                message: "Tidak Dapat Menemukan Data.",
            });
        }

        const mangroveLength = tree.purchases.filter(p => p.item === 0).length;
        const fertilizerLength = tree.purchases.filter(p => p.item === 1).length;

        return res.status(200).json({
            success: true,
            message: `Berhasil Mengambil data item ${email}`,
            data: {
                email: email,
                purchases: purchases.map((purchase) => ({
                    itemIndex: purchase.item,
                    cost: purchase.cost,
                    timestamp: purchase.timestamp,
                })),
                mangroveLength: mangroveLength,
                fertilizerLength: fertilizerLength,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error: Gagal mengambil data item",
        });
    }
};