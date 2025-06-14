const Mangrove = require("../models/Mangrove");
const User = require("../models/User");

function getStatusByDays(days) {
    if (days <= 2) return "Bibit";
    if (days <= 6) return "Muda";
    if (days <= 12) return "Dewasa";

    return "Tua";
}

function generateCoins(tree) {
    const now = Date.now();
    const last = new Date(tree.lastCoinGenerated).getTime();
    const diffHours = Math.floor((now - last) / (1000 * 60 * 60));

    if (diffHours <= 0) return tree;

    let totalCoins = 0;

    for (let i = 0; i < diffHours; i++) {
        totalCoins += Math.floor(Math.random() * (3 - 1 + 1)) + 1;
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
        const user = await User.findOne({ email });

        await mangrove.save();

        let isRemoved = false;
        const tempArray = [];

        user.purchases.forEach((purchase) => {
            if (!isRemoved && purchase.itemIndex === 0) {
                isRemoved = true;
            }
            else {
                tempArray.push(purchase);
            }
        })
        user.purchases = tempArray;
        user.save();

        const mangroveLength = user.purchases.filter(p => p.itemIndex === 0).length;
        const fertilizerLength = user.purchases.filter(p => p.itemIndex === 1).length;

        res.status(200).json({
            message: "Berhasil menyimpan data",
            status: 200,
            data: mangrove,
            mangroveLength: mangroveLength,
            fertilizerLength: fertilizerLength
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
        const user = await User.findOne({ email });

        const coins = tree.coins;

        tree.coins = 0;
        tree.save();

        user.totalCoins += coins;
        user.save();

        res.status(200).json({
            message: `Berhasil mengambil koin`,
            status: 200,
            data: {
                coins,
            },
            userCoins: user.totalCoins
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

function reduceHealth(tree) {
    const now = Date.now();
    const last = new Date(tree.lastFertilized).getTime();
    const diffHours = Math.floor((now - last) / (1000 * 60 * 60));

    if (diffHours <= 0) return tree;

    tree.health = Math.max(tree.health - diffHours, 0);
    tree.lastFertilized = new Date(now);

    return tree;
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

        const updatedData = [];
        let healthTotal = 0;

        for (const tree of data) {
            const days = Math.floor(
                (Date.now() - new Date(tree.plantedAt)) / (1000 * 60 * 60 * 24)
            );

            const currentStatus = getStatusByDays(days);
            const coins = generateCoins(tree);
            const health = reduceHealth(tree);

            if (tree.health <= 0) {
                await tree.deleteOne();

                continue;
            }

            tree.status = currentStatus;
            healthTotal += tree.health;

            await coins.save();
            await health.save();
            await tree.save();

            updatedData.push(tree);
        }

        const healthAvg = (healthTotal / updatedData.length);

        res.status(200).json({
            message: `Berhasil mengambil dan memperbarui data ${coordinateState}`,
            status: 200,
            data: [
                ...updatedData
            ],
            healthAvg: healthAvg ? Number(healthAvg.toFixed(2)) : 0,
            healthTotal: healthTotal,
            dataLength: updatedData.length,
        });
    } 
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error: Gagal mengambil data",
            status: 500,
            error: error.message,
        });
    }
};

exports.addFertilizer = async (req, res) => {
    try {
        const { email } = req.params;
        const { coordinate } = req.body;

        if (!email || !coordinate) {
            return res.status(400).json({
                message: "Email atau koordinat tidak valid",
                status: 400,
            });
        }

        const mangrove = await Mangrove.findOne({ email, coordinate });
        const user = await User.findOne({ email });

        mangrove.health = (mangrove.health + 7) > 100 ? 100 : (mangrove.health + 7);
        mangrove.save();

        let isRemoved = false;
        const tempArray = [];

        user.purchases.forEach((purchase) => {
            if (!isRemoved && purchase.itemIndex === 1) {
                isRemoved = true;
            }
            else {
                tempArray.push(purchase);
            }
        })
        user.purchases = tempArray;
        user.save();

        const mangroveLength = user.purchases.filter(p => p.itemIndex === 0).length;
        const fertilizerLength = user.purchases.filter(p => p.itemIndex === 1).length;

        res.status(200).json({
            message: `Berhasil memberikan pupuk pada mangrove`,
            status: 200,
            data: mangrove,
            mangroveLength: mangroveLength,
            fertilizerLength: fertilizerLength
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error: Gagal memberikan pupuk",
            status: 500,
            error: error.message,
        });
    }
}

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
