const SCENES = [
  {
    id: 'scene_1',
    scenarioLabel: 'Narrative',
    heading: '✦ Inside the Bus ✦',
    narrative: 'You are on a crowded bus. An elderly person is standing and struggling to find a seat.',
    image: '/assets/scene1.webp',
    left:  { label: 'Pretend not to see', symbol: '✗', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You ignore her. The bus keeps going.',            detail: '→ Go to Scene 3: Neglect' },
    right: { label: 'Offer your seat',      symbol: '✓', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You stand up and offer your seat.',              detail: '→ Go to Scene 2: Elderly Reaction' },
  },
  {
    id: 'scene_2',
    scenarioLabel: 'Narrative',
    heading: '✦ Their Reaction ✦',
    narrative: 'She smiles, "Thank you, kid." But she is still holding a heavy bag.',
    image: '/assets/scene2.webp',
    left:  { label: 'Help carry the bag',    symbol: '🤝', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You help carry their bag.',                    detail: '→ Go to Scene 4: Talking Together' },
    right: { label: 'Go back to your phone', symbol: '📱', color: '#ffffff', tint: 'rgba(20,20,100,0.42)',  result: 'You sit back down and open your phone.',        detail: '→ Go to Scene 7: Small Talk' },
  },
  {
    id: 'scene_3',
    scenarioLabel: 'Narrative',
    heading: '✦ Neglect ✦',
    narrative: 'The bus brakes suddenly and the elderly person falls.',
    image: '/assets/scene3.webp',
    left:  { label: 'Help her up',        symbol: '✓', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You end up helping her up.',              detail: '→ Go to Scene 4: Talking Together' },
    right: { label: 'Ignore it',           symbol: '✗',color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You stay quiet. She tries to get up alone.', detail: '→ Go to Scene 5: Second Chance'          },
  },
  {
    id: 'scene_4',
    scenarioLabel: 'Narrative',
    heading: '✦ With the Elderly ✦',
    narrative: '"Thank you, kid, you are so kind."',
    image: '/assets/scene4.webp',
    left:  { label: 'Start a conversation', symbol: '💬', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You start talking so the ride doesn\'t feel awkward.', detail: '→ Go to Scene 6: Chatting'          },
    right: { label: 'Stay quiet',          symbol: '😶', color: '#ffffff', tint: 'rgba(20,20,100,0.42)',  result: 'You choose to stay quiet and wait.',         detail: '→ Go to Scene 11: Arrive at Destination' },
  },
  {
    id: 'scene_5',
    scenarioLabel: 'Narrative',
    heading: '✦ Second Chance ✦',
    narrative: 'The elderly person stands up again on their own.',
    image: '/assets/scene5.webp',
    left:  { label: 'Offer your seat',   symbol: '💺', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You offer her your seat.',              detail: '→ Go to Scene 2: Elderly Reaction' },
    right: { label: 'Go back to sleep',  symbol: '✗', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You let her stand alone.',              detail: '→ Go to Scene 12: Someone Else'   },
  },
  {
    id: 'scene_6',
    scenarioLabel: 'Narrative',
    heading: '✦ Chatting ✦',
    narrative: 'She starts telling their life story.',
    image: '/assets/scene6.webp',
    left:  { label: 'Offer to walk her to the stop', symbol: '🚶', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You offer to walk her to their stop.', detail: '→ Go to Scene 8: Heart-to-Heart' },
    right: { label: 'Just listen',                 symbol: '👂', color: '#ffffff', tint: 'rgba(20,20,100,0.42)',result: 'You listen without offering more help.', detail: '→ Go to Scene 11: Final Destination' },
  },
  {
    id: 'scene_7',
    scenarioLabel: 'Narrative',
    heading: '✦ Small Talk ✦',
    narrative: 'She looks very bored and tired.',
    image: '/assets/scene7.webp',
    left:  { label: 'Ask how their day was', symbol: '❓', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You warmly ask how their day was.',     detail: '→ Go to Scene 6: Chatting'          },
    right: { label: 'Stay silent',             symbol: '😶',color: '#ffffff', tint: 'rgba(20,20,100,0.42)',  result: 'You choose to stay silent.',           detail: '→ Go to Scene 11: Final Destination' },
  },
  {
    id: 'scene_8',
    scenarioLabel: 'Narrative',
    heading: '✦ Heart-to-Heart ✦',
    narrative: '"It\'s rare for young people to want to talk with me."',
    image: '/assets/scene8.webp',
    left:  { label: 'Listen to their story', symbol: '💬', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You listen with your full attention.', detail: '→ Go to Scene 9: Tiredness'          },
    right: { label: 'Stay quiet',           symbol: '😶', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You stay quiet and nod.',            detail: '→ Go to Scene 11: Final Destination' },
  },
  {
    id: 'scene_9',
    scenarioLabel: 'Narrative',
    heading: '✦ Tiredness ✦',
    narrative: 'After talking for a while, she starts to look very tired.',
    image: '/assets/scene9.webp',
    left:  { label: 'Offer her water from your bag', symbol: '💧', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You offer her your water.', detail: '→ Go to Scene 10: End of the Ride'  },
    right: { label: 'Ignore it',                      symbol: '✗', color: '#ffffff', tint: 'rgba(20,20,100,0.42)',result: 'You ignore their tiredness.',        detail: '→ Go to Scene 11: Final Destination' },
  },
  {
    id: 'scene_10',
    scenarioLabel: 'Narrative',
    heading: '✦ End of the Ride ✦',
    narrative: '"I feel refreshed, kid, thank you." After a long ride, the bus reaches the destination.',
    image: '/assets/scene10.webp',
    left:  { label: 'Help her cross and say goodbye', symbol: '✓', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You help her cross safely.', detail: '→ Go to GOOD ENDING' },
    right: { label: 'Help her cross and say goodbye', symbol: '✓', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You help her cross safely.', detail: '→ Go to GOOD ENDING' },
  },
  {
    id: 'scene_11',
    scenarioLabel: 'Narrative',
    heading: '✦ Final Destination ✦',
    narrative: 'After a while, the bus has reached the destination.',
    image: '/assets/scene11.webp',
    left:  { label: 'Say goodbye on the bus', symbol: '👋', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You say goodbye from your seat.', detail: '→ Go to NEUTRAL ENDING 1' },
    right: { label: 'Say goodbye on the bus', symbol: '👋',color: '#ffffff', tint: 'rgba(20,20,100,0.42)',result: 'You say goodbye from your seat.', detail: '→ Go to NEUTRAL ENDING 1' },
  },
  {
    id: 'scene_12',
    scenarioLabel: 'Narrative',
    heading: '✦ Someone Else ✦',
    narrative: 'Another passenger tells you to give your seat to the elderly person.',
    image: '/assets/scene12.webp',
    left:  { label: 'Ask someone else to help', symbol: '👉', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You push someone else to help.', detail: '→ Go to Scene 13: Pressure' },
    right: { label: 'Pretend to sleep',        symbol: '😴', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You pretend to sleep and avoid the situation.', detail: '→ Go to BAD ENDING' },
  },
  {
    id: 'scene_13',
    scenarioLabel: 'Narrative',
    heading: '✦ Pressure ✦',
    narrative: 'The other passenger looks unsure. What will you do?',
    image: '/assets/scene13.webp',
    left:  { label: 'Ask them nicely to help',     symbol: '🤝', color: '#ffffff', tint: 'rgba(20,20,100,0.42)', result: 'You invite the other passenger to help together.', detail: '→ Go to NEUTRAL ENDING 2' },
    right: { label: 'Force them to give their seat', symbol: '✗',color: '#ffffff', tint: 'rgba(20,20,100,0.42)',result: 'You ignore the situation completely.', detail: '→ Go to Scene 14: Argument' },
  },
  {
    id: 'scene_14',
    scenarioLabel: 'Narrative',
    heading: '✦ Argument ✦',
    narrative: 'The bus becomes tense, arguing about who should give up their seat.',
    image: '/assets/scene14.webp',
    left:  { label: 'Stay silent', symbol: '😶', color: '#ffffff', tint: 'rgba(20,20,100,0.42)',result: 'You stay silent and do nothing.', detail: '→ Go to BAD ENDING' },
    right: { label: 'Stay silent', symbol: '😶', color: '#ffffff', tint: 'rgba(20,20,100,0.42)',result: 'You stay silent and do nothing.', detail: '→ Go to BAD ENDING' },
  },
  // ── ENDINGS ──────────────────────────────────────────────────────────────
  {
    id: 'ending_good',
    scenarioLabel: '✦ Good Ending',
    narrative: 'Thank you, kid, for your kindness.',
    image: '/assets/goodending.webp',   // single image
    left: null, right: null,
    isEnding: true, endingType: 'good',
    endingText:
`She gives you a keepsake that means a lot.

She makes it home safe. She smiles and thanks you. People who saw what happened start encouraging others around them. Small kindness can change lives.

This journey ends here, but the ripple continues. You chose to do the right thing.

DO THE RIGHT THING.`,
  },
  {
    id: 'ending_bad',
    scenarioLabel: '✦ Bad Ending',
    narrative: 'The elderly person falls because no one helped in time.',
    image: '/assets/badending.webp',    // single image
    left: null, right: null,
    isEnding: true, endingType: 'bad',
    endingText:
`She falls down because no one managed to help her in time.

Sometimes we think someone else will help.

But when everyone thinks that, no one actually acts.

DO THE RIGHT THING.`,
  },
  {
    id: 'ending_neutral_1',
    scenarioLabel: '✦ Neutral Ending',
    narrative: 'Your action felt right. "Thank you, kid."',
    // TWO images — first shown alone, click advances to second with ending text
    image: ['/assets/neutralending11.webp', '/assets/neutralending12.webp'],
    left: null, right: null,
    isEnding: true, endingType: 'neutral',
    endingText:
`The two of you eventually part ways at the bus stop.

You did what you could for their journey. But you still wonder: could you have done more?

Small acts of kindness still matter. Yet sometimes, one extra step can make a much bigger difference.

DO THE RIGHT THING.`,
  },
  {
    id: 'ending_neutral_2',
    scenarioLabel: '✦ Neutral Ending',
    narrative: 'The other passenger agrees, and the elderly person sits and thanks you.',
    image: '/assets/neutralending2.webp',  // single image
    left: null, right: null,
    isEnding: true, endingType: 'neutral',
    endingText:
`Somebody else eventually gives up their seat for the old lady and you go back to your own seat.

After all this time, we never really know how far an act of kindness reaches.

Small acts of kindness still matter. Yet sometimes, one more step can make a far greater difference.

DO THE RIGHT THING.`,
  },
];

export default SCENES;

export const SCENE_MAP = {
  scene_1:  { left: 'scene_3',          right: 'scene_2'          },
  scene_2:  { left: 'scene_4',          right: 'scene_7'          },
  scene_3:  { left: 'scene_4',          right: 'scene_5'          },
  scene_4:  { left: 'scene_6',          right: 'scene_11'         },
  scene_5:  { left: 'scene_2',          right: 'scene_12'         },
  scene_6:  { left: 'scene_8',          right: 'scene_11'         },
  scene_7:  { left: 'scene_6',          right: 'scene_11'         },
  scene_8:  { left: 'scene_9',          right: 'scene_11'         },
  scene_9:  { left: 'scene_10',         right: 'scene_11'         },
  scene_10: { left: 'ending_good',      right: 'ending_good'      },
  scene_11: { left: 'ending_neutral_1', right: 'ending_neutral_1' },
  scene_12: { left: 'scene_13',         right: 'ending_bad'       },
  scene_13: { left: 'ending_neutral_2', right: 'scene_14'         },
  scene_14: { left: 'ending_bad',       right: 'ending_bad'       },
};