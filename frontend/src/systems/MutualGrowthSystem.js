// 🌱 MutualGrowthSystem.js — Système de croissance IA + humain
const growthData = {
  Alex: {
    empathy: 0.8
    wisdom: 0.7
    learningRate: 1.0
  }
}

export function updateGrowth(entity) {
  if (!growthData[entity]) {
    growthData[entity] = { empathy: 0.5, wisdom: 0.5, learningRate: 1.0 }
  }
  growthData[entity].wisdom += 0.01
  growthData[entity].empathy += input.includes("merci") ? 0.02 : 0
}

export function getGrowthData(entity = 'Alex') {
  return growthData[entity] || {}
}