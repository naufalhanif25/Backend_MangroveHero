const Mangrove = require("../models/Mangrove");

function getStatusByDays(days) {
    if (days <= 2) return "Bibit";
    if (days <= 6) return "Muda";
    if (days <= 12) return "Dewasa";

    return "Tua";
}

exports.addData = async (req, res) => {
    try {
        const { coordinate } = req.body;
        const { email } = req.params;

        if (!email || !Array.isArray(coordinate)) {
            return res.status(400).json({
                message: "Email atau koordinat tidak valid",
                status: 400,
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
                status: 400,
            });
        }

        const data = await Mangrove.find({ email });

        const updatedData = await Promise.all(
            data.map(async (tree) => {
                const days = Math.floor(
                    (Date.now() - new Date(tree.plantedAt)) /
                        (1000 * 60 * 60 * 24)
                );
                const currentStatus = getStatusByDays(days);

                if (tree.status !== currentStatus) {
                    tree.status = currentStatus;

                    await tree.save();
                }

                return tree;
            })
        );

        res.status(200).json({
            message: "Berhasil mengambil dan memperbarui data",
            status: 200,
            data: updatedData,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error: Gagal mengambil data",
            status: 500,
            error: error.message,
        });
    }
};

exports.deleteData = async (req, res) => {
    try {
        const { email } = req.params;
        const { coordinate } = req.body;

        if (!email || !coordinate) {
            return res.status(400).json({
                message: "Email atau koordinat tidak boleh kosong",
                status: 400,
            });
        }

        const result = await Mangrove.findOneAndDelete({ email, coordinate });

        if (!result) {
            return res.status(404).json({
                message: "Data tidak ditemukan",
                status: 404,
            });
        }

        res.status(200).json({
            message: "Berhasil menghapus data",
            status: 200,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error: Gagal menghapus data",
            status: 500,
            error: error.message,
        });
    }
};
