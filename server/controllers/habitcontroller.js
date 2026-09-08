const Habit = require('../models/habitmodel');
const mongoose= require('mongoose')
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
        const { userId } = req.user;

        const objectId = new mongoose.Types.ObjectId(userId);

        const todayIST = new Date().toLocaleDateString('en-CA', {
            timeZone: 'Asia/Kolkata'
        });


        const startOfToday = new Date(
            `${todayIST}T00:00:00+05:30`
        );


        const start7Days = new Date(startOfToday);
        start7Days.setUTCDate(start7Days.getUTCDate() - 6);

        const start30Days = new Date(startOfToday);
        start30Days.setUTCDate(start30Days.getUTCDate() - 29);

        const endDate = new Date(startOfToday);
        endDate.setUTCDate(endDate.getUTCDate() + 1);

        const last7Days = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(start7Days);
            date.setUTCDate(date.getUTCDate() + i);

            last7Days.push(
                date.toLocaleDateString('en-CA', {
                    timeZone: 'Asia/Kolkata'
                })
            );
        }


        const analytics = await Habit.aggregate([
    
            {
                $match: {
                    user: objectId
                }
            },

      
            {
                $facet: {

                    streakLeaderboard: [
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                streak: 1
                            }
                        },
                        {
                            $sort: {
                                streak: -1
                            }
                        }
                    ],

                    //pie chart
                    habitCompletion: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                value: {
                                    $size: "$completedDates"
                                }
                            }
                        }
                    ],

                    heatmap: [
                        {
                            $unwind: "$completedDates"
                        },
                        {
                            $match: {
                                completedDates: {
                                    $gte: start30Days,
                                    $lt: endDate
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",                  
                                name: {
                                    $first: "$name"
                                },
                                completedDates: {
                                    $push: {
                                        $dateToString: {
                                            format: "%Y-%m-%d",
                                            date: "$completedDates",
                                            timezone: "Asia/Kolkata"
                                        }
                                    }
                                }
                            }
                        }
                    ],

                    daily: [
                        {
                            $unwind: "$completedDates"
                        },
                        {
                            $match: {
                                completedDates: {
                                    $gte: start7Days,
                                    $lt: endDate
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: "%Y-%m-%d",
                                        date: "$completedDates",
                                        timezone: "Asia/Kolkata"
                                    }
                                },
                                count: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        }
                    ],

                    dayStats: [
                        {
                            $unwind: "$completedDates"
                        },
                        {
                            $group: {
                                _id: null,

                                weekday: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    {
                                                        $dayOfWeek: {
                                                            date: "$completedDates",
                                                            timezone: "Asia/Kolkata"
                                                        }
                                                    },
                                                    [1, 7]
                                                ]
                                            },
                                            0,
                                            1
                                        ]
                                    }
                                },

                                weekend: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    {
                                                        $dayOfWeek: {
                                                            date: "$completedDates",
                                                            timezone: "Asia/Kolkata"
                                                        }
                                                    },
                                                    [1, 7]
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);



        const result = analytics[0];

        const streakLeaderboard = result.streakLeaderboard;

        const habitCompletion = result.habitCompletion;



        const heatmapMap = new Map(
            result.heatmap.map(habit => [
                habit._id.toString(),
                habit.completedDates
            ])
        );

        const heatmapData = habitCompletion.map(habit => ({
            name: habit.name,
            completedDates:
                heatmapMap.get(habit._id.toString()) || []
        }));


        const dailyCompletions = result.daily;

        const countsByDate = Object.fromEntries(
            dailyCompletions.map(item => [
                item._id,
                item.count
            ])
        );

        const completionsPerDay = last7Days.map(date => ({
            date,
            count: countsByDate[date] || 0
        }));



        const weekday = result.dayStats[0]?.weekday || 0;
        const weekend = result.dayStats[0]?.weekend || 0;



        let insight;

        if (weekday === 0 && weekend === 0) {
            insight = "Start completing habits to see insights!";
        } else if (weekday > weekend) {
            insight = "You complete habits more on weekdays! 💪";
        } else if (weekend > weekday) {
            insight = "You complete habits more on weekends! 🎉";
        } else {
            insight = "You are consistent across the week! 🔥";
        }

  
        res.status(200).json({
            streakLeaderboard,
            completionsPerDay,
            habitCompletion: habitCompletion.map(habit => ({
                name: habit.name,
                value: habit.value
            })),
            heatmapData,
            insight
        });

    } catch (error) {
        console.error("Analytics Error:", error);

        res.status(500).json({
            msg: error.message
        });
    }
};
module.exports = {createHabit,deleteHabit, getHabits,completeHabit,getAnalytics}