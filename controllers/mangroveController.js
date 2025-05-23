const Mangrove = require("../models/Mangrove");

function getStatusByDays(days) {
    if (days <= 2) return "Bibit";
    if (days <= 6) return "Muda";
    if (days <= 12) return "Dewasa";

    return "Tua";
}

function generateCoins(tree) {
    const now = Date.now();
    const last = new Date(tree.lastCoinGenerated).getTime();
    const diffMinutes = Math.floor((now - last) / 60000);

    if (diffMinutes <= 0) return tree;

    let totalCoins = 0;

    for (let i = 0; i < diffMinutes; i++) {
        totalCoins += Math.floor(Math.random() * (8 - 2 + 1)) + 2;
    }

    tree.coins += totalCoins;
    tree.lastCoinGenerated = new Date(now);

    return tree;
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

exports.getCoins = async (req, res) => {
    try {
        const { email, row, column } = req.params;
        const coordinate = [row, column];

        if (!email || !coordinate) {
            return res.status(400).json({
                message: "Email atau koordinat tidak ditemukan",
                status: 400,
            });
        }

        const tree = await Mangrove.findOne({ email, coordinate });
        const coins = tree.coins;

        tree.coins = 0;
        tree.save();

        res.status(200).json({
            message: `Berhasil mengambil koin`,
            status: 200,
            data: {
                coins,
            },
        });
    }
    catch (error) {
        res.status(200).json({
            message: `Internal Server Error: Gagal mengambil koin`,
            status: 200,
            error: error.message,
        });
    }
}

exports.getData = async (req, res) => {
    try {
        const { email, row, column } = req.params;
        const coordinateState = row && column;
        const coordinate = [row, column];

        if (!email) {
            return res.status(400).json({
                message: "Email tidak ditemukan",
                status: 400,
            });
        }

        let data;

        if (coordinateState) {
            data = await Mangrove.find({ email, coordinate });
        } else {
            data = await Mangrove.find({ email });
        }

        const updatedData = await Promise.all(
            data.map(async (tree) => {
                const days = Math.floor(
                    (Date.now() - new Date(tree.plantedAt)) /
                        (1000 * 60 * 60 * 24)
                );
                const currentStatus = getStatusByDays(days);
                const coins = generateCoins(tree);

                tree.status = currentStatus;

                await coins.save();
                await tree.save();

                return tree;
            })
        );

        res.status(200).json({
            message: `Berhasil mengambil dan memperbarui data ${coordinateState}`,
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
