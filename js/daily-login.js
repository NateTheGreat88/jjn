// Daily Login Reward System
// Tracks login streaks, gives daily coins, and milestone rewards

(function() {
    'use strict';
    
    const STREAK_STORAGE_KEY = 'jnjLoginStreak';
    const LAST_LOGIN_STORAGE_KEY = 'jnjLastLogin';
    
    // Milestone rewards: { days: coins }
    const MILESTONE_REWARDS = {
        7: 5,      // 7 days: 5 coins
        14: 10,    // 14 days: 10 coins
        30: 25,    // 30 days: 25 coins
        60: 50,    // 60 days: 50 coins
        100: 100   // 100 days: 100 coins
    };
    
    // Base daily reward (1 coin)
    const BASE_DAILY_REWARD = 1;
    
    // Streak bonus multiplier (0.1 coins per day of streak, max 5 coins bonus)
    const MAX_STREAK_BONUS = 5;
    
    // Get today's date as YYYY-MM-DD string
    function getTodayString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }
    
    // Get yesterday's date as YYYY-MM-DD string
    function getYesterdayString() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }
    
    // Calculate days between two date strings
    function daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    // Load streak data from localStorage
    function loadStreakData() {
        try {
            const streakData = localStorage.getItem(STREAK_STORAGE_KEY);
            const lastLogin = localStorage.getItem(LAST_LOGIN_STORAGE_KEY);
            
            return {
                streak: streakData ? parseInt(streakData) : 0,
                lastLogin: lastLogin || null,
                totalLogins: parseInt(localStorage.getItem('jnjTotalLogins') || '0'),
                milestones: JSON.parse(localStorage.getItem('jnjLoginMilestones') || '[]')
            };
        } catch (e) {
            console.error('Error loading streak data:', e);
            return {
                streak: 0,
                lastLogin: null,
                totalLogins: 0,
                milestones: []
            };
        }
    }
    
    // Save streak data to localStorage
    function saveStreakData(streak, lastLogin, totalLogins, milestones) {
        try {
            localStorage.setItem(STREAK_STORAGE_KEY, streak.toString());
            localStorage.setItem(LAST_LOGIN_STORAGE_KEY, lastLogin);
            localStorage.setItem('jnjTotalLogins', totalLogins.toString());
            localStorage.setItem('jnjLoginMilestones', JSON.stringify(milestones));
        } catch (e) {
            console.error('Error saving streak data:', e);
        }
    }
    
    // Add coins to user's balance
    async function addCoins(amount) {
        try {
            // Update localStorage
            const currentCoins = parseInt(localStorage.getItem('jnjCoins') || '0');
            const newCoins = currentCoins + amount;
            localStorage.setItem('jnjCoins', newCoins.toString());
            
            // Update Firebase if authenticated
            if (window.authSystem && window.authSystem.isAuthenticated()) {
                const user = window.authSystem.getUser();
                if (user && user.uid) {
                    // Load current profile
                    const userData = await window.authSystem.loadUserData(user.uid);
                    if (userData && userData.profile) {
                        const profile = userData.profile;
                        profile.coins = (profile.coins || 0) + amount;
                        
                        // Save to Firebase
                        await window.authSystem.saveUserData({ profile: profile });
                    }
                }
            }
            
            return newCoins;
        } catch (e) {
            console.error('Error adding coins:', e);
            return parseInt(localStorage.getItem('jnjCoins') || '0');
        }
    }
    
    // Check and process daily login reward
    async function checkDailyLogin() {
        try {
            const today = getTodayString();
            const data = loadStreakData();
            
            // If already logged in today, don't process again
            if (data.lastLogin === today) {
                return {
                    claimed: true,
                    streak: data.streak,
                    reward: 0,
                    message: 'You\'ve already claimed your daily reward today!'
                };
            }
            
            let newStreak = data.streak;
            let reward = BASE_DAILY_REWARD;
            let milestoneReward = 0;
            let milestoneMessage = '';
            const milestones = [...data.milestones];
            
            // Check if this is a consecutive login
            if (data.lastLogin) {
                const daysSince = daysBetween(data.lastLogin, today);
                
                if (daysSince === 1) {
                    // Consecutive day - increase streak
                    newStreak = data.streak + 1;
                } else if (daysSince > 1) {
                    // Streak broken - reset to 1
                    newStreak = 1;
                } else {
                    // Same day (shouldn't happen, but handle it)
                    return {
                        claimed: true,
                        streak: data.streak,
                        reward: 0,
                        message: 'You\'ve already claimed your daily reward today!'
                    };
                }
            } else {
                // First login ever
                newStreak = 1;
            }
            
            // Calculate streak bonus (0.1 coins per day, max 5 coins)
            const streakBonus = Math.min(newStreak * 0.1, MAX_STREAK_BONUS);
            reward = BASE_DAILY_REWARD + Math.floor(streakBonus);
            
            // Check for milestone rewards
            const milestoneDays = Object.keys(MILESTONE_REWARDS).map(Number).sort((a, b) => a - b);
            for (const milestoneDay of milestoneDays) {
                if (newStreak === milestoneDay && !milestones.includes(milestoneDay)) {
                    milestoneReward = MILESTONE_REWARDS[milestoneDay];
                    milestones.push(milestoneDay);
                    milestoneMessage = `🎉 Milestone reached! ${milestoneDay} day streak bonus: ${milestoneReward} coins!`;
                    reward += milestoneReward;
                    break; // Only one milestone per day
                }
            }
            
            // Add coins
            const newCoins = await addCoins(reward);
            
            // Update total logins
            const totalLogins = data.totalLogins + 1;
            
            // Save streak data
            saveStreakData(newStreak, today, totalLogins, milestones);
            
            // Save to Firebase profile
            if (window.authSystem && window.authSystem.isAuthenticated()) {
                const user = window.authSystem.getUser();
                if (user && user.uid) {
                    try {
                        const userData = await window.authSystem.loadUserData(user.uid);
                        if (userData && userData.profile) {
                            const profile = userData.profile;
                            profile.loginStreak = newStreak;
                            profile.lastLogin = today;
                            profile.totalLogins = totalLogins;
                            profile.loginMilestones = milestones;
                            
                            await window.authSystem.saveUserData({ profile: profile });
                        }
                    } catch (e) {
                        console.error('Error saving streak to Firebase:', e);
                    }
                }
            }
            
            // Build reward message
            let message = `🎁 Daily Login Reward!\n\n`;
            message += `🔥 Streak: ${newStreak} day${newStreak !== 1 ? 's' : ''}\n`;
            message += `💰 Coins earned: ${reward}`;
            
            if (streakBonus > 0) {
                message += ` (${BASE_DAILY_REWARD} base + ${Math.floor(streakBonus)} streak bonus)`;
            }
            
            if (milestoneReward > 0) {
                message += `\n\n${milestoneMessage}`;
            }
            
            message += `\n\n💎 Total coins: ${newCoins}`;
            
            return {
                claimed: false,
                streak: newStreak,
                reward: reward,
                milestoneReward: milestoneReward,
                message: message,
                totalCoins: newCoins
            };
        } catch (e) {
            console.error('Error checking daily login:', e);
            return {
                claimed: false,
                streak: 0,
                reward: 0,
                message: 'Error processing daily login reward'
            };
        }
    }
    
    // Load streak data from Firebase and sync to localStorage
    async function loadStreakFromFirebase() {
        try {
            if (!window.authSystem || !window.authSystem.isAuthenticated()) {
                return;
            }
            
            const user = window.authSystem.getUser();
            if (!user || !user.uid) {
                return;
            }
            
            const userData = await window.authSystem.loadUserData(user.uid);
            if (userData && userData.profile) {
                const profile = userData.profile;
                
                // Sync streak data from Firebase to localStorage
                if (profile.loginStreak !== undefined) {
                    localStorage.setItem(STREAK_STORAGE_KEY, profile.loginStreak.toString());
                }
                if (profile.lastLogin) {
                    localStorage.setItem(LAST_LOGIN_STORAGE_KEY, profile.lastLogin);
                }
                if (profile.totalLogins !== undefined) {
                    localStorage.setItem('jnjTotalLogins', profile.totalLogins.toString());
                }
                if (profile.loginMilestones) {
                    localStorage.setItem('jnjLoginMilestones', JSON.stringify(profile.loginMilestones));
                }
            }
        } catch (e) {
            console.error('Error loading streak from Firebase:', e);
        }
    }
    
    // Get current streak info (without processing login)
    function getStreakInfo() {
        const data = loadStreakData();
        const today = getTodayString();
        const claimedToday = data.lastLogin === today;
        
        return {
            streak: data.streak,
            lastLogin: data.lastLogin,
            totalLogins: data.totalLogins,
            milestones: data.milestones,
            claimedToday: claimedToday,
            nextMilestone: getNextMilestone(data.streak, data.milestones)
        };
    }
    
    // Get next milestone
    function getNextMilestone(currentStreak, claimedMilestones) {
        const milestoneDays = Object.keys(MILESTONE_REWARDS).map(Number).sort((a, b) => a - b);
        for (const milestoneDay of milestoneDays) {
            if (currentStreak < milestoneDay && !claimedMilestones.includes(milestoneDay)) {
                return {
                    days: milestoneDay,
                    daysRemaining: milestoneDay - currentStreak,
                    reward: MILESTONE_REWARDS[milestoneDay]
                };
            }
        }
        return null;
    }
    
    // Expose functions globally
    window.dailyLoginSystem = {
        checkDailyLogin: checkDailyLogin,
        loadStreakFromFirebase: loadStreakFromFirebase,
        getStreakInfo: getStreakInfo,
        getTodayString: getTodayString
    };
})();



