const activeCooldowns = new Set();

const submitRateLimmiter = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const key = `submit:${userId}:${problemId}`;

        if (activeCooldowns.has(key)) {
            return res.status(400).send("You have already submitted this problem recently. Please wait a few seconds.");
        }

        activeCooldowns.add(key);
        setTimeout(() => {
            activeCooldowns.delete(key);
        }, 10000); // 10 seconds cooldown

        next();
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    submitRateLimmiter
}
