const Habit = require('../models/habitmodel');

const createHabit= async(req,res)=>{
    try{
        const { name } = req.body;
        const { userId } = req.user; 
        const habit = await Habit.create({ name, user: userId });
      res.status(201).json({ habit });
    }
    catch(error){
        res.status(500).json({msg:error.message});
    }
    
}
const deleteHabit= async(req,res)=>{
    try{
        const{userId}= req.user;
        const habitId = req.params.id;
        const habit = await Habit.findOne({_id:habitId, user:userId});
        if (!habit) {
            return res.status(404).json({ msg: "habit not found" })
        }
        await habit.deleteOne();
        res.status(200).json({ msg: "habit deleted" })
    }
    catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
const getHabits = async (req, res) => {
    try {
        const { userId } = req.user;
        const habits = await Habit.find({ user: userId });
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
        
        await Promise.all(habits.map(async (habit) => {
            const lastDate = habit.completedDates[habit.completedDates.length - 1];
            const lastDateStr = lastDate ? new Date(lastDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : null;

            if (lastDateStr !== today && habit.completed !== false) {
                habit.completed = false;
            }
            if (lastDateStr !== today && lastDateStr !== yesterdayStr && habit.streak > 0) {
                habit.streak = 0;
            }
            if (habit.isModified()) await habit.save();
        }));

        res.status(200).json({ habits });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
const completeHabit = async (req, res) => {
    try {
        const { userId } = req.user;
        const habit = await Habit.findOne({ _id: req.params.id, user: userId });

        if (!habit) return res.status(404).json({ msg: "Habit not found" });

        const today = new Date().toDateString();
        const todayIndex = habit.completedDates.findIndex(d =>
            new Date(d).toDateString() === today
        );

        if (todayIndex !== -1) {

            habit.completedDates.splice(todayIndex, 1);
            habit.streak = Math.max(0, habit.streak - 1);
            habit.completed = false;
        } else {
            
            habit.completedDates.push(new Date());
            habit.streak += 1;
            habit.completed = true;
        }

        await habit.save();
        res.status(200).json({ habit });
    } catch (error) {
        console.error("Backend Error Details:", error);
        res.status(500).json({ msg: error.message });
    }
};
const getAnalytics = async (req, res) => {
    try {
        const { userId } = req.user
        const habits = await Habit.find({ user: userId })

        //Leaderboard
        const streakLeaderboard = habits
            .map(h => ({
                name: h.name,
                streak: h.streak
            }))
            .sort((a, b) => b.streak - a.streak)

        //Pie chart 
        const habitCompletion = habits.map(h => ({
            name: h.name,
            value: h.completedDates.length
        }))

        const heatmapData = habits.map(h=>({
            name:h.name,
            completedDates :h.completedDates
        }))
        //Last 7 days labels
        const last7Days = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            last7Days.push(d.toISOString().split('T')[0])
        }

        // 4. Count completions per day (SIMPLE LOOP)
        const completionsPerDay = []

        for (let date of last7Days) {
            let count = 0;
            for (let habit of habits) {
                for (let d of habit.completedDates) {
                    if (new Date(d).toISOString().split('T')[0] === date) {
                        count++
                    }
                }
            }
            completionsPerDay.push({ date, count })
        }

        // 5. Weekday / weekend
        let weekday = 0
        let weekend = 0

        for (let habit of habits) {
            for (let d of habit.completedDates) {
                const day = new Date(d).getDay()

                if (day === 0 || day === 6) weekend++
                else weekday++
            }
        }

        const insight =
            weekday > weekend
                ? "You complete habits more on weekdays! 💪"
                : "You complete habits more on weekends! 🎉"

        res.status(200).json({
            streakLeaderboard,
            completionsPerDay,
            habitCompletion,
            heatmapData,
            insight
        })

    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

module.exports = {createHabit,deleteHabit, getHabits,completeHabit,getAnalytics}