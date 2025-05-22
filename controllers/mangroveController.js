const Mangrove = require("../models/Mangrove");

exports.addData = async (req, res) => {
    try {
        const { coordinate } = req.body;
        const { email } = req.params;

        if (!email || !Array.isArray(coordinate)) {
            return res.status(400).json({
                message: "Email atau koordinat tidak valid",
                status: 400
            });
        }

        const mangrove = new Mangrove({ coordinate, email });
        await mangrove.save();

        res.status(200).json({
            message: "Berhasil menyimpan data",
            status: 200,
            data: mangrove,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error: Gagal menyimpan data",
            status: 500,
            error: error.message,
        });
    }
};

exports.getData = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                message: "Email tidak ditemukan",
                status: 400
            });
        }

        const data = await Mangrove.find({ email });

        res.status(200).json({
            message: "Berhasil mengambil data",
            status: 200,
            data,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error: Gagal mengambil data",
            status: 500,
            error: error.message,
        });
    }
};
