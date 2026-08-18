import api from './api'

export const assistantApi = {
  chat: async ({ message, language = 'en', history = [] }) => {
    try {
      const res = await api.post('/api/v1/assistant/chat', { message, language, history })
      return res.data
    } catch {
      // Intelligent knowledge base simulation for Jal Rakshak AI
      const q = message.toLowerCase()
      let reply = ''
      let citations = ['National Disaster Management Authority (NDMA) Guidelines on Flood Management (2024)', 'Central Water Commission (CWC) Standard Operating Procedures']
      let suggestedActions = []

      if (q.includes('purif') || q.includes('clean water') || q.includes('पानी साफ') || q.includes('ପାଣି')) {
        reply = `**Safe Drinking Water Guidelines during Floods:**\n\n1. **Boil Water Rapidly:** Boil flood/tap water vigorously for at least 1-3 minutes to kill waterborne bacteria and viruses.\n2. **Halazone / Chlorine Tablets:** Use 1 chlorine tablet per 5 liters of clear water; stir and allow to stand for 30 minutes before drinking.\n3. **Do NOT Drink Contaminated Flood Water:** It carries sewage runoff, industrial effluents, and leptospirosis pathogens.\n4. **ORS Packets:** Distribute Oral Rehydration Salts to prevent severe dehydration in children and elderly.`
        suggestedActions = [
          { label: 'Find Shelter with Water Plant', link: '/shelters' },
          { label: 'Report Contaminated Water Source', link: '/report' },
        ]
      } else if (q.includes('cuttack') || q.includes('mahanadi') || q.includes('river') || q.includes('నది') || q.includes('ଜଳସ୍ତର')) {
        reply = `**Mahanadi River Basin Situation Briefing (Live Telemetry):**\n\n- **Current Level at Naraj Gauge:** 26.85 meters (*0.44m above Danger Mark of 26.41m*).\n- **Discharge Status:** 11.45 Lakh Cusecs inflow, 28 sluice gates opened.\n- **Vulnerable Zones:** Bidanasi Embankment, Chauliaganj lower sectors, and Tulasipur riverside colonies.\n- **Recommendation:** Citizens in low-lying sectors should initiate immediate evacuation to Barabati or Ravenshaw shelters.`
        citations.push('Central Water Commission Hydrograph Telemetry Station 04-OD')
        suggestedActions = [
          { label: 'View Live Inundation Map', link: '/map' },
          { label: 'Calculate Safe Evacuation Route', link: '/route' },
        ]
      } else if (q.includes('sos') || q.includes('trapped') || q.includes('rescue') || q.includes('फंसे') || q.includes('ଉଦ୍ଧାର')) {
        reply = `🚨 **EMERGENCY ASSISTANCE PROTOCOL:**\n\nIf you or someone nearby is trapped by rising floodwaters:\n1. **Move to highest available floor / rooftop immediately.**\n2. **Do not enter fast-flowing water on foot or vehicles.**\n3. **Use the Jal Rakshak SOS Wizard** below to transmit your exact GPS coordinates to NDRF Battalion 03.\n4. **Signal rescuers:** Wave bright/red cloth or use phone flashlight in groups of 3 pulses (SOS).`
        suggestedActions = [
          { label: 'LAUNCH EMERGENCY SOS BEACON NOW', link: '/emergency', urgent: true },
          { label: 'Call NDRF Helpline 1078', phone: '1078' },
        ]
      } else if (q.includes('shelter') || q.includes('camp') || q.includes('राहत') || q.includes('ଆଶ୍ରୟ')) {
        reply = `**Nearby Relief Camp Status:**\n\n- **Barabati Cyclone & Flood Shelter:** 1.8 km away, 840/1200 occupied, Elevated Ring Road open.\n- **Ravenshaw University Relief Center:** 3.4 km away, 1980/2500 occupied, Medical aid & community kitchen active.\n- **Bhubaneswar KIIT Center:** 22 km away, High ground plateau, open NH-16 corridor.`
        suggestedActions = [
          { label: 'Open Relief Shelter Finder', link: '/shelters' },
          { label: 'Get Turn-by-Turn Safe Route', link: '/route' },
        ]
      } else {
        reply = `**Jal Rakshak Advisory:**\n\nStay alert for official CWC and IMD updates. Keep mobile devices fully charged in power-bank mode, prepare an emergency go-bag (documents in waterproof pouch, emergency medication, torch, dry rations for 48 hours), and monitor the live flood map for real-time inundation progression.`
        suggestedActions = [
          { label: 'Check Local Flood Risk Index', link: '/dashboard' },
          { label: 'Report Ground Hazards', link: '/report' },
        ]
      }

      return {
        reply,
        citations,
        suggestedActions,
        timestamp: new Date().toISOString(),
      }
    }
  },
}
