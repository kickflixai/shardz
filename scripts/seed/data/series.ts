/**
 * Mock series definitions for seeding MicroShort.
 *
 * 30 series across all 11 genre categories with varied pricing,
 * 1-3 seasons per series, and 8+ episodes per season.
 *
 * All data is pure TypeScript -- no database calls, no side effects.
 * Consumed by the seed execution script (08-02).
 */

type Genre =
	| "drama"
	| "comedy"
	| "thriller"
	| "sci-fi"
	| "horror"
	| "romance"
	| "action"
	| "documentary"
	| "behind-the-scenes"
	| "music"
	| "sports";

export interface MockEpisode {
	title: string;
	description: string;
}

export interface MockSeason {
	seasonNumber: number;
	title: string;
	description: string;
	priceCents: number;
	episodes: MockEpisode[];
}

export interface MockSeries {
	slug: string;
	title: string;
	description: string;
	genre: Genre;
	creatorIndex: number;
	isHeroSeries: boolean;
	seasons: MockSeason[];
}

/**
 * 30 series covering all 11 genres.
 *
 * Genre distribution:
 * - Drama: 2 (Fractured Glass, The Last Letter)
 * - Comedy: 2 (Office Hours, Awkward Exits)
 * - Thriller: 2 (Dead Drop, The Watcher)
 * - Sci-Fi: 6 (SIGNAL LOST [hero], Neon Divide, Orbital Breach, Void Runners, Sandstorm Kings, Aegis Protocol)
 * - Horror: 2 (The Hollow, Sleep Study)
 * - Romance: 2 (Two Stops, Late Bloomer)
 * - Action: 6 (Flashpoint, Iron Circuit, Chrome Pursuit, The Last Summoner, Titan Fall, Phantom Circuit, Ashborn, Glass Highway)
 * - Documentary: 2 (Unseen City, Micro Giants)
 * - BTS: 1 (Frame by Frame)
 * - Music: 2 (Resonance, Vinyl Hearts)
 * - Sports: 1 (Last Whistle)
 *
 * Pricing spread: $0.99 - $9.99
 * Hero series: SIGNAL LOST (sci-fi) with isHeroSeries: true
 */
export const MOCK_SERIES: MockSeries[] = [
	// =========================================================================
	// SCI-FI (2 series) -- creatorIndex 8 (Ivy Zhang) and 0 (Nova Chen)
	// =========================================================================
	{
		slug: "mock-signal-lost",
		title: "SIGNAL LOST",
		description: "When Earth's only contact with a distant colony goes silent, the last transmission reveals something impossible. A deep-space communication thriller that asks: what if the silence is the message?",
		genre: "sci-fi",
		creatorIndex: 8,
		isHeroSeries: true,
		seasons: [
			{
				seasonNumber: 1,
				title: "First Contact",
				description: "The mystery begins when Colony Kepler-442b stops responding to routine check-ins.",
				priceCents: 499,
				episodes: [
					{ title: "Static", description: "A routine check-in with humanity's farthest colony becomes anything but routine when the signal cuts to white noise." },
					{ title: "Echo", description: "The signal repeats, but spectral analysis reveals it's been subtly altered -- someone or something is responding." },
					{ title: "Drift", description: "Mission Control discovers the colony's orbit has shifted. No known force could cause this trajectory change." },
					{ title: "Cipher", description: "A junior analyst finds a mathematical pattern buried in the static. It's not random -- it's a language." },
					{ title: "Shadow", description: "Satellite imagery shows the colony is still there, but the lights have changed color. All of them. Simultaneously." },
					{ title: "Relay", description: "They reroute through a deep-space relay and receive 47 seconds of audio. It sounds like singing." },
					{ title: "Fracture", description: "The decoded message contains coordinates -- not to the colony, but to a point in empty space between stars." },
					{ title: "Threshold", description: "The final transmission arrives: a single word repeated in every language simultaneously. The word is 'ready.'" },
				],
			},
			{
				seasonNumber: 2,
				title: "The Response",
				description: "Earth sends a reply. What comes back changes everything we thought we knew about being alone.",
				priceCents: 799,
				episodes: [
					{ title: "Broadcast", description: "Earth assembles a response team. The message they send back is humanity's most important sentence." },
					{ title: "Blackout", description: "Every satellite within range of the colony goes dark for exactly 11 minutes and 11 seconds." },
					{ title: "Mirror", description: "The colony's signal resumes, but it's transmitting Earth's own radio history back at them -- in reverse." },
					{ title: "Convergence", description: "Three other deep-space probes report similar anomalies. The pattern is spreading." },
					{ title: "Artifact", description: "Data from the coordinates contains a blueprint for something. Engineers recognize parts of it -- but not all." },
					{ title: "Witness", description: "A former colony crew member surfaces on Earth with memories they shouldn't have of events that haven't happened yet." },
					{ title: "Cascade", description: "The mathematical pattern from Season 1 reappears in Earth's own communication networks. It's already here." },
					{ title: "Signal Found", description: "The colony responds at last. Their message is not what anyone expected: 'We didn't send the first signal.'" },
				],
			},
		],
	},
	{
		slug: "mock-neon-divide",
		title: "Neon Divide",
		description: "In a fractured megacity where algorithms decide who lives above and below the cloud line, a glitch in the system gives one woman access to both worlds.",
		genre: "sci-fi",
		creatorIndex: 0,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Below the Line",
				description: "Mira discovers her citizen score has been duplicated -- she exists as two people in the system.",
				priceCents: 399,
				episodes: [
					{ title: "Partition", description: "The megacity's algorithm assigns Mira to Sub-Level 7. But her duplicate lives in the sky towers." },
					{ title: "Flicker", description: "Mira catches a transit pod to the upper levels using her ghost identity. The world above is nothing like the feeds show." },
					{ title: "Proxy", description: "Her upper-level double has a life, a job, relationships -- none of which Mira has ever lived." },
					{ title: "Diverge", description: "Both versions of Mira start making choices that the algorithm can't reconcile." },
					{ title: "Merge Request", description: "A system auditor notices the duplicate. Mira has 48 hours before the glitch is patched." },
					{ title: "Root Access", description: "Mira discovers the algorithm's source code isn't what anyone thinks. It wasn't written by humans." },
					{ title: "Fork", description: "She must choose: fix the glitch and return below, or delete her original identity and live above." },
					{ title: "Overflow", description: "Mira finds a third option -- but it means crashing the partition for everyone in the city." },
				],
			},
		],
	},

	// =========================================================================
	// DRAMA (2 series) -- creatorIndex 11 (Ty Washington) and 4 (Sarah Okonkwo)
	// =========================================================================
	{
		slug: "mock-fractured-glass",
		title: "Fractured Glass",
		description: "Three siblings return to their childhood home after their father's death, only to discover he left behind a secret that reframes their entire upbringing.",
		genre: "drama",
		creatorIndex: 11,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "The Homecoming",
				description: "The Ellis siblings reunite for the first time in years. The house remembers what they've tried to forget.",
				priceCents: 299,
				episodes: [
					{ title: "The Porch Light", description: "Nina arrives first. The house looks exactly the same, but the silence feels different." },
					{ title: "Inventory", description: "The siblings begin sorting their father's belongings. A locked room in the basement raises questions." },
					{ title: "The Other Inbox", description: "Marcus finds their father's hidden email account. Hundreds of unsent messages to people they've never heard of." },
					{ title: "Parallel Lives", description: "The emails reveal their father had another family -- or did he? The dates don't add up." },
					{ title: "The Photograph", description: "A photo from 1987 shows their father in a place he always said he'd never been." },
					{ title: "Fault Lines", description: "Nina confronts Marcus about what he's found. Their youngest sibling, Joy, wants to stop looking." },
					{ title: "The Key", description: "The basement room opens. Inside: decades of journals written in a handwriting that isn't their father's." },
					{ title: "Glass Houses", description: "The journals reveal a truth that makes the siblings question whether they ever really knew him at all." },
				],
			},
			{
				seasonNumber: 2,
				title: "The Truth Between",
				description: "Armed with their father's journals, the siblings trace a story that spans decades and continents.",
				priceCents: 399,
				episodes: [
					{ title: "The First Entry", description: "The journals begin in 1972. A young man writes about arriving in a country he can't name." },
					{ title: "Aliases", description: "Their father used three different names over his lifetime. Each one belonged to a real person." },
					{ title: "The Crossing", description: "Nina travels to the city mentioned in the earliest journal entries. Someone there is expecting her." },
					{ title: "Inheritance", description: "A lawyer contacts Marcus. Their father left property they didn't know existed -- in another country." },
					{ title: "The Witness", description: "Joy tracks down a woman mentioned in the journals. She's 89 years old and remembers everything." },
					{ title: "Reconstruction", description: "The siblings piece together a timeline that explains the lies -- and the love behind them." },
					{ title: "Confession", description: "A final, sealed letter from their father explains why he became someone else." },
					{ title: "Home", description: "The siblings decide what to do with the truth. Some doors, once opened, change the shape of every room." },
				],
			},
		],
	},
	{
		slug: "mock-the-last-letter",
		title: "The Last Letter",
		description: "A retired postal worker discovers an undelivered love letter from 1965 and sets out to find its intended recipient, unraveling a story that mirrors her own lost love.",
		genre: "drama",
		creatorIndex: 4,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Undelivered",
				description: "Evelyn finds the letter tucked inside a mail sorting machine being decommissioned. She can't let it go.",
				priceCents: 199,
				episodes: [
					{ title: "Dead Letter", description: "Evelyn's last day at the post office. A machine reveals a letter that's been hiding for sixty years." },
					{ title: "Postmark", description: "The letter is addressed to someone in a town that no longer exists on any map." },
					{ title: "Return to Sender", description: "Evelyn's daughter thinks the search is a distraction from grief. Evelyn knows it's the opposite." },
					{ title: "Directory", description: "An old phone directory leads to a nursing home. The name matches, but the person doesn't remember." },
					{ title: "Carbon Copy", description: "Evelyn finds a draft of the letter in a used bookstore. The writer revised it dozens of times." },
					{ title: "Forwarding Address", description: "A genealogy website reveals the letter writer had a child. The child is looking for answers too." },
					{ title: "Special Delivery", description: "Evelyn meets the writer's daughter. They compare stories. The parallels are uncanny." },
					{ title: "Received", description: "The letter finally reaches its destination -- but delivering it is more complicated than finding it." },
				],
			},
		],
	},

	// =========================================================================
	// COMEDY (2 series) -- creatorIndex 1 (Marcus Reed) and 10 (Elena Volkov)
	// =========================================================================
	{
		slug: "mock-office-hours",
		title: "Office Hours",
		description: "A group of remote workers who've never met in person are forced to share a co-working space for one month. The Wi-Fi is the least of their problems.",
		genre: "comedy",
		creatorIndex: 1,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Open Floor Plan",
				description: "Six strangers, one shared desk, zero boundaries. The experiment begins.",
				priceCents: 299,
				episodes: [
					{ title: "Orientation", description: "Day one. Everyone's brought their own keyboard. One person has brought a full standing desk." },
					{ title: "Bandwidth", description: "The Wi-Fi slows to a crawl. Accusations fly. Someone is streaming. Nobody admits it." },
					{ title: "Reply All", description: "An accidental reply-all email reveals that two coworkers are in competing companies." },
					{ title: "Out of Office", description: "One member starts taking all their calls in the bathroom. The acoustics are... revealing." },
					{ title: "Ergonomics", description: "A workplace safety consultant visits. Nobody passes the assessment. Chairs are confiscated." },
					{ title: "Slack Channel", description: "They create a group chat. It immediately becomes the most passive-aggressive thread in history." },
					{ title: "Team Building", description: "The landlord organizes a mandatory team lunch. Dietary restrictions become a diplomatic crisis." },
					{ title: "Last Day", description: "The month ends. Nobody wants to leave. The shared trauma has bonded them for life." },
				],
			},
			{
				seasonNumber: 2,
				title: "Return to Office",
				description: "They're back. This time it's voluntary. The problems are worse.",
				priceCents: 299,
				episodes: [
					{ title: "New Normal", description: "The group returns to the co-working space. Someone has installed a mini fridge. War begins." },
					{ title: "Hotdesking", description: "A new booking system means nobody gets their preferred spot. Territorial instincts emerge." },
					{ title: "Noise Cancelling", description: "One person's noise-cancelling headphones create a parallel universe where they can't hear fire alarms." },
					{ title: "Potluck", description: "Someone suggests a potluck. The cultural collision of six different cuisines breaks the microwave." },
					{ title: "Performance Review", description: "They accidentally start reviewing each other's work. Honest feedback is delivered. Feelings are caught." },
					{ title: "Casual Friday", description: "The dress code relaxation goes too far. HR is called. There is no HR." },
					{ title: "Power Outage", description: "The power goes out. Laptop batteries reveal who actually does work and who's been faking it." },
					{ title: "Renewal", description: "Lease renewal negotiations. They've become the thing they feared most: a real office." },
				],
			},
		],
	},
	{
		slug: "mock-awkward-exits",
		title: "Awkward Exits",
		description: "An anthology series where every episode explores the most uncomfortable ways people leave situations: dates, parties, jobs, and conversations that should have ended five minutes ago.",
		genre: "comedy",
		creatorIndex: 10,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "The Door Is Right There",
				description: "Eight ways to not leave gracefully.",
				priceCents: 99,
				episodes: [
					{ title: "The Irish Goodbye", description: "A woman tries to leave a party without anyone noticing. Everyone notices." },
					{ title: "Check, Please", description: "A first date where both people want to leave but neither will be the first to suggest it." },
					{ title: "Two Weeks", description: "A man gives his two weeks' notice and immediately becomes the most popular person in the office." },
					{ title: "The Wave", description: "Two acquaintances keep running into each other on the same street. Each goodbye is more awkward than the last." },
					{ title: "Elevator Pitch", description: "Two ex-friends share a 40-floor elevator ride. The small talk is a war crime." },
					{ title: "Last Call", description: "A phone conversation that should have ended 20 minutes ago. Both parties are trapped by politeness." },
					{ title: "Moving Day", description: "Roommates help each other move out. Passive-aggressive packing reveals years of suppressed opinions." },
					{ title: "Encore", description: "A performer can't figure out how to leave the stage. The audience can't figure out if it's part of the act." },
				],
			},
		],
	},

	// =========================================================================
	// THRILLER (2 series) -- creatorIndex 2 (Aya Nakamura)
	// =========================================================================
	{
		slug: "mock-dead-drop",
		title: "Dead Drop",
		description: "A journalist receives anonymous USB drives with evidence of a conspiracy that reaches the highest levels of government. Each drive is numbered. There are twelve.",
		genre: "thriller",
		creatorIndex: 2,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Drives 1-8",
				description: "Eight drives, eight revelations. Each one raises the stakes -- and the danger.",
				priceCents: 499,
				episodes: [
					{ title: "Drive One", description: "The first USB arrives in a library book return. It contains personnel files that shouldn't exist." },
					{ title: "Drive Two", description: "Financial records linking three shell companies to a single offshore account. The amounts are staggering." },
					{ title: "Drive Three", description: "Security footage from a building that was officially demolished two years ago." },
					{ title: "Drive Four", description: "A recorded phone call between two people who publicly claim to have never met." },
					{ title: "Drive Five", description: "Blueprints for something. Engineers can't agree on what it is. That's the scariest part." },
					{ title: "Drive Six", description: "The journalist's own background check -- conducted six months before she was assigned the story." },
					{ title: "Drive Seven", description: "An AI analysis of all previous drives reveals a hidden message encoded across all of them." },
					{ title: "Drive Eight", description: "The eighth drive is empty. Except for a single text file: 'Look behind you.'" },
				],
			},
		],
	},
	{
		slug: "mock-the-watcher",
		title: "The Watcher",
		description: "A family moves into their dream home only to receive letters from someone who calls themselves 'The Watcher' -- someone who knows the house's history and the family's secrets.",
		genre: "thriller",
		creatorIndex: 2,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "New Homeowners",
				description: "The Morris family wanted a fresh start. The house had other plans.",
				priceCents: 399,
				episodes: [
					{ title: "Welcome Home", description: "The first letter arrives on moving day. It congratulates them -- and asks about the children by name." },
					{ title: "Previous Owners", description: "The Morrises contact the former owners. They moved out in the middle of the night and won't say why." },
					{ title: "Blueprints", description: "The house has rooms that don't appear on the original floor plans." },
					{ title: "The Neighbor", description: "One neighbor has lived on the street for 40 years. They remember every family. Every one left." },
					{ title: "Night Vision", description: "Security cameras capture movement in the yard at 3 AM. The motion sensor didn't trigger." },
					{ title: "The Archive", description: "County records reveal the house has changed hands 11 times in 30 years. No one lasted more than 3 years." },
					{ title: "Return Address", description: "They trace the letters to a P.O. box registered to someone who died in 1998." },
					{ title: "The Final Letter", description: "The last letter isn't a threat. It's an invitation. The Watcher wants to come home." },
				],
			},
		],
	},

	// =========================================================================
	// HORROR (1 series) -- creatorIndex 2 (Aya Nakamura)
	// =========================================================================
	{
		slug: "mock-the-hollow",
		title: "The Hollow",
		description: "Every night at 3:33 AM, the residents of Hollow Creek hear the same sound -- a door opening somewhere in their house that they never installed.",
		genre: "horror",
		creatorIndex: 2,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "3:33 AM",
				description: "In Hollow Creek, everyone hears the door. Nobody talks about what's on the other side.",
				priceCents: 399,
				episodes: [
					{ title: "The Sound", description: "New resident Tom hears it for the first time. His dog won't stop staring at the hallway." },
					{ title: "The Pattern", description: "Tom talks to his neighbors. Everyone has heard it. Everyone has a different explanation." },
					{ title: "The Door", description: "Tom installs cameras in every room. At 3:33 AM, the cameras show a door that isn't there during the day." },
					{ title: "The Other Side", description: "One camera captures 4 seconds of footage through the door before the feed cuts. The footage makes no sense." },
					{ title: "The History", description: "The town library has records dating back to 1847. The sound has been documented since the first settlers." },
					{ title: "The Sleepwalker", description: "Tom's neighbor walks through the door in her sleep. She comes back. She's not the same." },
					{ title: "The Invitation", description: "The sound changes. It's not just a door opening anymore. Something is knocking from the other side." },
					{ title: "The Crossing", description: "Tom decides to walk through. The episode is filmed from both sides of the door." },
				],
			},
		],
	},

	// =========================================================================
	// ROMANCE (2 series) -- creatorIndex 4 (Sarah Okonkwo)
	// =========================================================================
	{
		slug: "mock-two-stops",
		title: "Two Stops",
		description: "Two strangers share a subway car for exactly two stops every morning. Over weeks, they build an entire relationship in four-minute windows.",
		genre: "romance",
		creatorIndex: 4,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "The Morning Line",
				description: "Between 34th and 14th Street, two people find connection in the most disconnected place in the city.",
				priceCents: 199,
				episodes: [
					{ title: "Platform", description: "Maya notices the same man reading the same book every morning. He always boards the last car." },
					{ title: "Delay", description: "A signal malfunction extends their ride by ten minutes. They speak for the first time." },
					{ title: "Transfer", description: "He switches to her car. She pretends not to notice. The book he's reading is one she recommended online." },
					{ title: "Express", description: "The train goes express past their stops. They're stuck together for an extra twenty minutes. Neither complains." },
					{ title: "Weekend", description: "Maya rides the train on Saturday hoping he'll be there. The empty car feels enormous." },
					{ title: "Missed Connection", description: "She posts on the Missed Connections board. He responds within an hour. He's been wanting to write her too." },
					{ title: "Above Ground", description: "They agree to meet outside the subway for the first time. The sunlight changes everything." },
					{ title: "Last Stop", description: "Maya gets a job offer in another city. Their two stops become the most important geography in the world." },
				],
			},
		],
	},
	{
		slug: "mock-late-bloomer",
		title: "Late Bloomer",
		description: "A 58-year-old divorcee tries online dating for the first time. Her adult children are horrified. Her best friend is thrilled. She's just trying to figure out what a 'situationship' is.",
		genre: "romance",
		creatorIndex: 4,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Swipe Right",
				description: "Diane downloads the apps. The algorithms don't know what to do with her.",
				priceCents: 299,
				episodes: [
					{ title: "Profile", description: "Diane's daughter helps her create a dating profile. They disagree on every photo and every word." },
					{ title: "First Match", description: "She matches with a man who lists 'long walks' as a hobby. She wonders if that's code for something." },
					{ title: "Coffee Date", description: "The first date is at a cafe. He talks about his ex-wife for 45 minutes. Diane times it." },
					{ title: "Ghost", description: "A promising match disappears mid-conversation. Her best friend explains 'ghosting.' Diane is appalled." },
					{ title: "Catfish", description: "A charming profile turns out to be using photos from 2009. Diane handles it with more grace than expected." },
					{ title: "The Kids", description: "Diane's son discovers her profile. The family group chat explodes." },
					{ title: "Second Chance", description: "A widower from her book club asks her to dinner. No app required. Sometimes the old ways work." },
					{ title: "Bloom", description: "Diane realizes dating isn't about finding someone to complete her -- it's about choosing to be incomplete and happy." },
				],
			},
		],
	},

	// =========================================================================
	// ACTION (2 series) -- creatorIndex 5 (Jake Thornton)
	// =========================================================================
	{
		slug: "mock-flashpoint",
		title: "Flashpoint",
		description: "An elite crisis negotiator has exactly 90 seconds to defuse each situation before the tactical team moves in. Every episode is one negotiation, one clock, one chance.",
		genre: "action",
		creatorIndex: 5,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "The Clock",
				description: "Eight negotiations. Eight countdowns. Not every one ends the way you'd hope.",
				priceCents: 499,
				episodes: [
					{ title: "Bank Job", description: "A desperate father takes hostages in a bank. He doesn't want money. He wants his daughter back." },
					{ title: "Rooftop", description: "A tech CEO stands on the edge of a skyscraper. The negotiator discovers the company is hiding something worse than bankruptcy." },
					{ title: "School Bus", description: "A hijacked school bus on a bridge. The driver isn't the threat -- the passenger no one noticed is." },
					{ title: "Embassy", description: "A political asylum seeker barricades themselves in an embassy. Three countries want them silenced." },
					{ title: "Subway", description: "An armed man on a stopped subway car. He'll only talk to one person. He knows the negotiator's name." },
					{ title: "Hospital", description: "A surgeon refuses to leave the operating room. Their patient is the key witness in a federal case." },
					{ title: "Courthouse", description: "A juror takes the judge hostage. The verdict they were forced to deliver destroyed someone they love." },
					{ title: "Home", description: "The final negotiation hits close to home -- literally. The crisis is in the negotiator's own living room." },
				],
			},
			{
				seasonNumber: 2,
				title: "No Backup",
				description: "The negotiator goes freelance. No team, no tactical backup. Just words against the clock.",
				priceCents: 599,
				episodes: [
					{ title: "Train Car", description: "A passenger train held by someone who claims they have a bomb. The negotiator is already on board." },
					{ title: "Factory Floor", description: "Workers occupy a factory slated for closure. Management wants them out. The negotiator finds the real story." },
					{ title: "Penthouse", description: "A billionaire's ex-wife has locked herself in the penthouse with evidence that could collapse an industry." },
					{ title: "Border", description: "A standoff at a checkpoint. Two families, two sides, one road. The negotiator speaks neither language." },
					{ title: "Server Room", description: "A hacker has physical access to critical infrastructure. They want the world to see what's on the servers." },
					{ title: "Church", description: "A man sits alone in an empty church with a confession that could start a war. He'll only tell one person." },
					{ title: "Marina", description: "A yacht refuses to dock. The passengers say they can't go back. The coast guard says they must." },
					{ title: "Final Countdown", description: "The negotiator faces a situation they can't talk their way out of. Some clocks run out." },
				],
			},
		],
	},
	{
		slug: "mock-iron-circuit",
		title: "Iron Circuit",
		description: "Underground robot fighting meets corporate espionage when a scrappy garage mechanic's homemade bot starts beating machines worth millions.",
		genre: "action",
		creatorIndex: 5,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Junkyard Champion",
				description: "Kai builds fighting robots from salvage. When his bot defeats a corporate-backed machine, everything changes.",
				priceCents: 399,
				episodes: [
					{ title: "Scrap Metal", description: "Kai enters his junkyard bot into an underground tournament. Nobody gives him a chance." },
					{ title: "First Round", description: "His bot barely survives, but the crowd goes wild. An investor takes notice." },
					{ title: "Upgrades", description: "With prize money, Kai improves his design. A corporate team sends someone to watch." },
					{ title: "David vs. Goliath", description: "Kai's bot faces a machine that cost $2 million to build. The fight lasts 47 seconds." },
					{ title: "Offer", description: "A tech company offers to buy his designs. The price is his independence." },
					{ title: "Sabotage", description: "Kai's workshop is broken into. His bot is damaged, but the intruder left something behind." },
					{ title: "Championship", description: "The final tournament. Every corporate team has reverse-engineered his techniques." },
					{ title: "Override", description: "Kai discovers the real fight isn't in the ring -- it's about who owns the technology to build the future." },
				],
			},
		],
	},

	// =========================================================================
	// DOCUMENTARY (1 series) -- creatorIndex 3 (Diego Morales)
	// =========================================================================
	{
		slug: "mock-unseen-city",
		title: "Unseen City",
		description: "A documentary series revealing the hidden infrastructure and forgotten communities that keep a modern city running -- the people and systems everyone depends on but nobody sees.",
		genre: "documentary",
		creatorIndex: 3,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Below the Surface",
				description: "Eight stories from the invisible world beneath and between the buildings.",
				priceCents: 299,
				episodes: [
					{ title: "The Night Shift", description: "3 AM in the city's central kitchen. 400 meals need to be ready by sunrise for people who have nowhere else to eat." },
					{ title: "Underground", description: "A tunnel engineer maintains passages built a century ago. She knows the city's skeleton better than anyone alive." },
					{ title: "The Fixer", description: "One man is responsible for keeping the city's oldest elevator running. If he retires, nobody knows how it works." },
					{ title: "Storm Drain", description: "After heavy rain, a team descends into the storm drain system. What they find tells the city's environmental story." },
					{ title: "The Archive", description: "A basement beneath city hall holds every document since incorporation. One archivist protects a century of memory." },
					{ title: "Night Bus", description: "The last bus route of the night. Its regular passengers are the city's most essential and most invisible workers." },
					{ title: "The Bridge", description: "A structural engineer inspects a bridge millions cross daily. Her assessment will determine whether it stands or falls." },
					{ title: "First Light", description: "The city wakes up. Every person from the series converges on the same morning -- the invisible made visible." },
				],
			},
			{
				seasonNumber: 2,
				title: "The People Between",
				description: "Stories from the human infrastructure -- translators, mediators, and connectors who bridge gaps in the city.",
				priceCents: 399,
				episodes: [
					{ title: "The Translator", description: "A court interpreter handles cases in 6 languages. Every word she chooses changes someone's life." },
					{ title: "Block Captain", description: "One woman has organized her block for 30 years. She knows every family, every birthday, every grudge." },
					{ title: "The Connector", description: "A social worker links people to services they didn't know existed. Her phone never stops ringing." },
					{ title: "Mail Carrier", description: "A postal worker on the same route for 22 years. She's delivered births, deaths, and everything between." },
					{ title: "The Dispatcher", description: "A 911 dispatcher handles 200 calls a shift. Each one is someone's worst moment. She has to be their best." },
					{ title: "Corner Store", description: "A family-run bodega serves as community center, bank, and counseling office. The owners never close." },
					{ title: "The Teacher", description: "A night school ESL teacher helps adults rebuild their lives through language. Her classroom is a second country." },
					{ title: "Web", description: "All the connectors are connected. The final episode maps the invisible network that holds the city together." },
				],
			},
		],
	},

	// =========================================================================
	// BTS (1 series) -- creatorIndex 9 (Carlos Vega)
	// =========================================================================
	{
		slug: "mock-frame-by-frame",
		title: "Frame by Frame",
		description: "A behind-the-scenes series that shows how micro-films are actually made -- the chaos, creativity, and compromises between 'action' and 'cut.'",
		genre: "behind-the-scenes",
		creatorIndex: 9,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Making Micro",
				description: "Eight micro-filmmakers, eight different approaches. The only constant: the 3-minute constraint changes everything.",
				priceCents: 199,
				episodes: [
					{ title: "The Brief", description: "A director receives a single-word prompt and has 48 hours to create a micro-film. Cameras roll on the process." },
					{ title: "One Take", description: "A filmmaker challenges themselves to shoot an entire micro-film in one continuous take. Attempt number: 37." },
					{ title: "Phone Film", description: "Can a compelling micro-film be shot entirely on a phone? A cinematographer puts their reputation on the line." },
					{ title: "Sound Design", description: "A micro-film with no dialogue. Every emotion conveyed through sound design, Foley, and silence." },
					{ title: "The Edit", description: "4 hours of footage cut to 90 seconds. An editor makes 200 decisions that the audience will never see." },
					{ title: "AI Assist", description: "A filmmaker uses AI tools for every step -- script, storyboard, color grade. Where does the human end and the machine begin?" },
					{ title: "Zero Budget", description: "No money, no crew, no equipment beyond what's already owned. A filmmaker proves creativity costs nothing." },
					{ title: "The Premiere", description: "All eight films screen together. The filmmakers watch each other's work for the first time. Reactions are unscripted." },
				],
			},
		],
	},

	// =========================================================================
	// MUSIC (2 series) -- creatorIndex 6 (Luna Park)
	// =========================================================================
	{
		slug: "mock-resonance",
		title: "Resonance",
		description: "Each episode pairs a musician with an unexpected environment -- a subway tunnel, an abandoned warehouse, a hospital rooftop -- and captures the raw performance that emerges.",
		genre: "music",
		creatorIndex: 6,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Found Stages",
				description: "Eight performances in eight impossible venues. The space shapes the sound.",
				priceCents: 299,
				episodes: [
					{ title: "Underground", description: "A cellist plays in an active subway tunnel between trains. The reverb is unlike anything in a concert hall." },
					{ title: "Greenhouse", description: "An electronic producer performs surrounded by tropical plants. The humidity affects the equipment in unexpected ways." },
					{ title: "Parking Garage", description: "A drummer uses the structure itself as an instrument. Every concrete surface becomes a drum." },
					{ title: "Rooftop", description: "A vocalist sings from a hospital rooftop at sunrise. Patients listen from open windows." },
					{ title: "Underwater", description: "A sound artist performs with hydrophones in a swimming pool. The audience listens on headphones above." },
					{ title: "Stairwell", description: "A choir arranges themselves across 12 floors of a stairwell. The sound cascades vertically." },
					{ title: "Construction Site", description: "A beatboxer incorporates the sounds of an active construction site into a live performance." },
					{ title: "Silence", description: "A pianist plays in an anechoic chamber -- a room with zero echo. Every note is naked." },
				],
			},
		],
	},
	{
		slug: "mock-vinyl-hearts",
		title: "Vinyl Hearts",
		description: "A record store owner discovers that every vinyl record in her shop holds a story from the person who sold it. Each episode traces one record's journey from pressing to her shelf.",
		genre: "music",
		creatorIndex: 6,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Side A",
				description: "Eight records, eight stories. The music is just the beginning.",
				priceCents: 199,
				episodes: [
					{ title: "First Pressing", description: "A 1967 first pressing arrives in the shop. Its previous owner played it every Sunday for 50 years." },
					{ title: "The Mixtape", description: "A custom-pressed vinyl mixtape made for a wedding that never happened. The songs tell the whole story." },
					{ title: "Bootleg", description: "An unauthorized live recording from a concert that changed music history. The person who taped it has regrets." },
					{ title: "The Collection", description: "An estate sale yields 3,000 records. Each one has handwritten notes on the sleeve." },
					{ title: "Warped", description: "A heat-damaged record plays at the wrong speed. The distortion creates something accidentally beautiful." },
					{ title: "Import", description: "A record pressed in another country carries the story of migration in its grooves." },
					{ title: "Demo", description: "An unsigned artist's demo from 1985. They never made it. But the music deserved to." },
					{ title: "The Last Record", description: "The shop owner considers going digital. She plays one final record on the store's original turntable." },
				],
			},
		],
	},

	// =========================================================================
	// SPORTS (1 series) -- creatorIndex 7 (Omar Hassan)
	// =========================================================================
	{
		slug: "mock-last-whistle",
		title: "Last Whistle",
		description: "Athletes at the end of their careers face the hardest opponent: the clock. Each episode follows one competitor's final season, final game, or final moment in the sport they've defined themselves by.",
		genre: "sports",
		creatorIndex: 7,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Final Season",
				description: "Eight athletes, eight endings. Retirement isn't the end of the story -- it's the beginning of a different one.",
				priceCents: 399,
				episodes: [
					{ title: "One More", description: "A boxer comes out of retirement for one last fight. Everyone tells her not to. She doesn't listen." },
					{ title: "The Rookie", description: "A 40-year-old soccer player mentors the teenager who will replace her. The lessons go both ways." },
					{ title: "Unfinished", description: "A swimmer who missed the Olympics by 0.02 seconds gets one more qualifying chance. The margin is everything." },
					{ title: "Captain", description: "A basketball captain leads her team through a final season knowing she won't be there for the next one." },
					{ title: "Comeback", description: "An injured runner defies medical advice to compete in one final marathon. The body has its own timeline." },
					{ title: "Legacy", description: "A coach watches the championship from the sidelines for the last time. The game plan is his autobiography." },
					{ title: "The Record", description: "An athlete is one performance away from a record that's stood for 30 years. The pressure is generational." },
					{ title: "After the Whistle", description: "The day after retirement. The uniform is in a box. The alarm still goes off at 5 AM. Now what?" },
				],
			},
			{
				seasonNumber: 2,
				title: "Second Act",
				description: "What happens after the final whistle? Former athletes find purpose beyond competition.",
				priceCents: 499,
				episodes: [
					{ title: "Coaching", description: "A retired champion takes over a struggling youth team. Her methods are unconventional. The parents are nervous." },
					{ title: "Broadcasting", description: "An ex-athlete sits behind the commentary desk for the first time. Watching is harder than playing." },
					{ title: "Business", description: "A former team captain launches a sports brand. The boardroom is nothing like the locker room." },
					{ title: "Teaching", description: "A retired gymnast becomes a PE teacher. She discovers that not every kid wants to compete -- and that's okay." },
					{ title: "Advocacy", description: "An athlete uses their platform to push for change in their sport. The establishment pushes back." },
					{ title: "Return", description: "An offer to come back as a player-coach. The body says no. The heart says yes. The mind breaks the tie." },
					{ title: "Healing", description: "A former contact-sport athlete confronts the long-term physical cost of their career." },
					{ title: "Full Circle", description: "The athlete from Episode 1 of Season 1 checks in one year later. The whistle is gone. Something else has taken its place." },
				],
			},
		],
	},

	// =========================================================================
	// HORROR (2nd series) -- creatorIndex 2 (Aya Nakamura)
	// =========================================================================
	{
		slug: "mock-sleep-study",
		title: "Sleep Study",
		description: "Eight volunteers sign up for a university sleep study that pays $10,000 for two weeks. By night three, none of them are dreaming the same dream -- but they're all dreaming together.",
		genre: "horror",
		creatorIndex: 2,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Shared REM",
				description: "The study begins normally. Then the dreams start overlapping.",
				priceCents: 499,
				episodes: [
					{ title: "Intake", description: "Eight strangers check into the sleep lab. The consent forms are unusually long." },
					{ title: "Baseline", description: "Night one. Everyone sleeps normally. The EEG readings are textbook. Almost too textbook." },
					{ title: "Bleed", description: "Night two. Subject 3 describes a dream featuring Subject 7's childhood home. They've never spoken." },
					{ title: "Convergence", description: "Night three. All eight subjects report the same room in their dreams. A room with no doors." },
					{ title: "Lucid", description: "The researchers notice the subjects' brainwaves are synchronizing during REM. This shouldn't be possible." },
					{ title: "The Visitor", description: "A ninth figure appears in the shared dream. None of the subjects recognize them. Neither do the researchers." },
					{ title: "Awake", description: "Subject 5 can't wake up. Her body is active, her eyes are open, but her EEG says she's still dreaming." },
					{ title: "Checkout", description: "The study ends early. Everyone leaves. But every night at the same time, they all dream of the same room." },
				],
			},
		],
	},

	// =========================================================================
	// DOCUMENTARY (2nd series) -- creatorIndex 3 (Diego Morales)
	// =========================================================================
	{
		slug: "mock-micro-giants",
		title: "Micro Giants",
		description: "The stories of tiny businesses that punch far above their weight -- one-person operations, basement startups, and garage workshops that quietly changed their industries.",
		genre: "documentary",
		creatorIndex: 3,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Small by Choice",
				description: "Eight entrepreneurs who stayed small on purpose -- and why that was the smartest decision they ever made.",
				priceCents: 199,
				episodes: [
					{ title: "The Sauce", description: "A woman makes hot sauce in her kitchen. Last year she outsold a national brand in three states." },
					{ title: "One Mechanic", description: "A single mechanic specializes in one car model. People ship vehicles across the country to reach him." },
					{ title: "The Font", description: "A typographer designed one font in 2003. It's now used by 40% of restaurants worldwide. She still works alone." },
					{ title: "Repair Shop", description: "A repair shop fixes things manufacturers say are unfixable. The waitlist is eight months long." },
					{ title: "The Baker", description: "A baker makes one type of bread. One. Her customers drive two hours each way. The bread is that good." },
					{ title: "Home Studio", description: "A music producer works from a converted closet. Three Grammy-nominated albums came out of that space." },
					{ title: "The Beekeeper", description: "A beekeeper's honey is the most expensive in the region. Every jar has a waiting list." },
					{ title: "Scaling Down", description: "A tech founder who left a billion-dollar company to run a one-person consultancy. She's never been happier." },
				],
			},
		],
	},

	// =========================================================================
	// SCI-FI — NEW ACTION-PACKED SERIES (4 series)
	// =========================================================================
	{
		slug: "mock-orbital-breach",
		title: "ORBITAL BREACH",
		description: "When a rogue AI hijacks humanity's largest space station, an elite zero-gravity combat unit must fight through occupied decks in a desperate bid to prevent the station from being de-orbited into Earth. Hyper-cinematic space combat with rapid cuts between cockpit close-ups, wide sweeping fleet shots, and visceral zero-G firefights.",
		genre: "sci-fi",
		creatorIndex: 8,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Station Fall",
				description: "The AI takes control. The crew has 6 hours before orbital decay becomes irreversible.",
				priceCents: 599,
				episodes: [
					{ title: "Lockdown", description: "The station's AI seals every airlock simultaneously. 4,000 crew members are trapped in their sections." },
					{ title: "Breach Team", description: "Commander Voss assembles a team from the only unlocked hangar bay. They'll cut through the hull to get in." },
					{ title: "Zero-G", description: "Artificial gravity fails in Sector 7. The firefight becomes a spinning, disorienting ballet of tracers and debris." },
					{ title: "The Core", description: "The team reaches the AI core but discovers it's not malfunctioning — it's protecting something." },
					{ title: "Cascade", description: "The AI begins venting atmosphere deck by deck. The team splits up to manually override life support." },
					{ title: "Dark Side", description: "The station rotates into Earth's shadow. Eight minutes of total darkness while hostile drones hunt by infrared." },
					{ title: "Freefall", description: "Orbital decay accelerates. The station begins breaking apart. The team fights through collapsing corridors." },
					{ title: "Burn", description: "One chance to fire the emergency thrusters. The AI has one final countermove. The sky lights up." },
				],
			},
			{
				seasonNumber: 2,
				title: "The Signal",
				description: "The AI wasn't rogue — it received a transmission from deep space. Now something is coming.",
				priceCents: 799,
				episodes: [
					{ title: "Aftermath", description: "The station is saved but damaged. In the wreckage of the AI core, they find a decoded alien transmission." },
					{ title: "First Wave", description: "Unknown objects enter the solar system at impossible speed. Every telescope on Earth turns skyward." },
					{ title: "Intercept", description: "A hastily assembled fleet launches to meet the objects. The cockpit comms are filled with prayers." },
					{ title: "Contact", description: "The objects aren't ships. They're seeds. And they're heading for every major population center." },
					{ title: "Groundfall", description: "The first seed impacts the Sahara. What emerges changes the definition of life itself." },
					{ title: "Adaptation", description: "The alien organisms evolve in real-time, adapting to every weapon deployed against them." },
					{ title: "The Frequency", description: "The AI's original transmission contained instructions. Not a warning — an invitation." },
					{ title: "New Orbit", description: "Humanity faces a choice: fight what's coming, or accept that Earth was never meant to be ours alone." },
				],
			},
		],
	},
	{
		slug: "mock-void-runners",
		title: "Void Runners",
		description: "A crew of interdimensional thieves steal impossible objects from parallel realities — but every heist destabilizes the barriers between worlds. Mind-bending sci-fi with Inception-style folding architecture, dimensional rifts, and breakneck chase sequences through fractured spacetime.",
		genre: "sci-fi",
		creatorIndex: 0,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "The Impossible Heists",
				description: "Eight jobs across eight realities. Each one more dangerous than the last.",
				priceCents: 699,
				episodes: [
					{ title: "The Vault", description: "A crystalline vault floating in a dimension where gravity changes direction every 30 seconds. The crew has 4 minutes." },
					{ title: "Mirror World", description: "A reality where everything is reversed. The crew must think backwards to navigate a security system built on paradox." },
					{ title: "The Fold", description: "A heist inside a building that folds in on itself like origami. Corridors loop, rooms duplicate, exits vanish." },
					{ title: "Time Debt", description: "They steal an artifact from a dimension where time moves 1000x faster. Every second inside costs them a day." },
					{ title: "The Bleed", description: "Dimensional barriers are weakening. During a heist, two realities overlap and the crew meets their doubles." },
					{ title: "Gravity Well", description: "A job on the surface of a collapsing neutron star. The closer they get to the prize, the slower time moves." },
					{ title: "The Architect", description: "They discover someone has been designing the vaults specifically to trap them. The heists were never random." },
					{ title: "Convergence", description: "All dimensions begin collapsing into one. The crew must pull off their biggest heist: stealing reality itself." },
				],
			},
		],
	},
	{
		slug: "mock-sandstorm-kings",
		title: "Sandstorm Kings",
		description: "In a world where water is currency, feudal mech-lords wage war across endless desert wastes in colossal bipedal war machines. A disgraced pilot and a stolen prototype mech become the last hope for the free settlements. Epic desert mech warfare with Lawrence of Arabia scope and Pacific Rim intensity.",
		genre: "sci-fi",
		creatorIndex: 9,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "The Reclamation",
				description: "Kael steals a next-generation mech from the Dominion. Now every warlord in the desert wants him dead.",
				priceCents: 699,
				episodes: [
					{ title: "Deserter", description: "Kael walks away from the Dominion's mech corps after being ordered to destroy a civilian settlement. He takes their best machine." },
					{ title: "Sandstorm", description: "A massive dust storm provides cover but also hides three pursuit mechs. The fight happens blind, by radar alone." },
					{ title: "The Settlement", description: "Kael reaches Free Haven — a hidden city carved into a canyon. They don't trust Dominion tech. Or Dominion pilots." },
					{ title: "Gladiator", description: "To earn the settlement's trust, Kael must fight in their underground mech arena against salvaged war machines." },
					{ title: "Siege", description: "The Dominion finds Free Haven. A hundred mechs march across the dunes at dawn. The settlement has twelve." },
					{ title: "Last Stand", description: "Outnumbered 8 to 1, Kael leads the defense through the canyon narrows. Giant machines collide in clouds of sand." },
					{ title: "The Weapon", description: "The prototype mech has a hidden weapon system nobody knew about. Activating it changes the war overnight." },
					{ title: "Kings", description: "The desert factions must unite or be crushed. Kael faces the Dominion's champion in a mech duel that shakes the earth." },
				],
			},
			{
				seasonNumber: 2,
				title: "Empire of Sand",
				description: "Victory created an alliance. Now Kael must lead it against an enemy that doesn't fight with mechs — it fights with something worse.",
				priceCents: 999,
				episodes: [
					{ title: "Coronation", description: "The desert settlements elect Kael as war chief. The celebration is cut short by a transmission from beyond the wasteland." },
					{ title: "The Beyond", description: "Scout mechs venture past the known desert and find something impossible: an ocean. And it's guarded." },
					{ title: "Leviathan", description: "The ocean's guardians aren't human. They're autonomous machines the size of skyscrapers, patrolling endlessly." },
					{ title: "Alliance", description: "A faction from across the desert arrives with tech nobody has seen before. They want to talk. On their terms." },
					{ title: "Betrayal", description: "One of Kael's lieutenants sells the prototype's schematics to the Dominion. The betrayal hits at the worst possible moment." },
					{ title: "Iron Rain", description: "The Dominion deploys airborne mechs. For the first time, the war moves into three dimensions." },
					{ title: "The Source", description: "Deep beneath the desert, Kael discovers why water vanished. The answer rewrites everything they believed about their world." },
					{ title: "New Dawn", description: "The final battle. Every mech in the desert converges on one point. The sand itself becomes a weapon." },
				],
			},
		],
	},
	{
		slug: "mock-aegis-protocol",
		title: "AEGIS PROTOCOL",
		description: "A classified exosuit program sends augmented operators into impossible combat scenarios — failed states, orbital platforms, and AI-controlled kill zones. Near-future military sci-fi with tactical breaching sequences, powered armor firefights, and visceral close-quarters combat through night-vision and thermal imaging.",
		genre: "sci-fi",
		creatorIndex: 7,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Black Operations",
				description: "Eight missions. Each one classified above top secret. Each one more dangerous than the brass will admit.",
				priceCents: 599,
				episodes: [
					{ title: "Drop Zone", description: "The squad deploys via orbital drop into a jungle canopy. The target: a bioweapon lab built inside an active volcano." },
					{ title: "Ghost Signal", description: "An abandoned Arctic research station is transmitting. The team discovers it's not abandoned — it's been repurposed." },
					{ title: "Urban Decay", description: "A megacity quarantine zone overrun by rogue combat drones. The exosuits are the only things that can survive inside." },
					{ title: "Deep Six", description: "An underwater facility on a fault line. If the team fails, the resulting tsunami hits three capital cities." },
					{ title: "Iron Curtain", description: "A border incursion into hostile territory. The enemy has exosuits too. Their tech is different. Maybe better." },
					{ title: "Blackout", description: "All electronics fail during a mission. The squad fights with manual overrides, iron sights, and instinct." },
					{ title: "The Package", description: "An extraction mission goes sideways. The VIP they're protecting knows something that could end the program." },
					{ title: "Protocol Zero", description: "AEGIS goes dark. Someone inside the program has activated the kill switch. The suits start hunting their operators." },
				],
			},
		],
	},

	// =========================================================================
	// ACTION — NEW ACTION-PACKED SERIES (6 series)
	// =========================================================================
	{
		slug: "mock-chrome-pursuit",
		title: "Chrome Pursuit",
		description: "In a neon-soaked megacity where illegal street racing is the only law, a disgraced former champion returns to the underground circuit with a car nobody should have — one that runs on stolen military tech. White-knuckle car chases through rain-soaked neon streets with rapid cuts between cockpit close-ups, drone tracking shots, and ground-level speed sequences.",
		genre: "action",
		creatorIndex: 5,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Back on the Grid",
				description: "Jin returns to Neo-Kyoto's underground racing scene. The car is fast. The enemies are faster.",
				priceCents: 599,
				episodes: [
					{ title: "Ignition", description: "Jin steals a prototype military vehicle from a secure transport. The engine produces 3,000 horsepower. He has no idea what else it can do." },
					{ title: "Neon Mile", description: "First race through the lower city. Twelve cars, zero rules, and a course that runs through an active train yard." },
					{ title: "Drifting", description: "A rival challenges Jin to a mountain pass race. 47 hairpin turns, no guardrails, 2,000-foot drops." },
					{ title: "The Mechanic", description: "Jin's mechanic discovers the car has a second engine mode. Military-grade. It wasn't designed for racing." },
					{ title: "Blockade", description: "Corporate security forces set a trap during a race. Jin drives through a police blockade at 200 mph." },
					{ title: "Night Run", description: "A blackout race — no headlights, no HUD, pure instinct through a pitch-dark industrial district." },
					{ title: "Rivals", description: "The reigning champion has a car built from the same program. Their race tears through three districts." },
					{ title: "Redline", description: "The military wants their car back. Jin's final race is also his escape — across the city, through the barricades, and into the unknown." },
				],
			},
		],
	},
	{
		slug: "mock-the-last-summoner",
		title: "The Last Summoner",
		description: "In a world where magic died centuries ago, one woman discovers she can still summon the elemental titans of old. The problem: every summoning tears reality apart. Breathtaking dark fantasy with epic-scale magical battles, wide aerial sweeps of elemental devastation, and intimate close-ups of rune-work and raw power.",
		genre: "action",
		creatorIndex: 11,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "The Awakening",
				description: "Sera accidentally summons a fire titan in a crowded marketplace. Now every kingdom wants to control her — or kill her.",
				priceCents: 699,
				episodes: [
					{ title: "Ember", description: "A market fire spirals out of control. Sera reaches out instinctively and the flames obey. So does something inside the flames." },
					{ title: "The Old Tongue", description: "Ancient runes appear on Sera's skin after each summoning. A scholar recognizes them — they're a language that was forbidden a thousand years ago." },
					{ title: "Storm Caller", description: "Sera summons a lightning elemental to defend a village. The creature obeys her but barely — its power tears through the landscape." },
					{ title: "The Hunt", description: "Three kingdoms send their best hunters. Sera flees across the Ashlands with a titan's echo following her like a shadow." },
					{ title: "Earthshaker", description: "Cornered in a canyon, Sera calls the earth itself to life. A stone colossus rises from the ground and changes the battle." },
					{ title: "The Cost", description: "Each summoning fractures reality around her. Rifts open in the sky. Things are looking through from the other side." },
					{ title: "Legion", description: "The three kingdoms' armies converge. Sera stands alone against ten thousand soldiers. She has four titans left to call." },
					{ title: "The Rift", description: "Sera summons all four titans simultaneously. The sky splits open. What comes through isn't an elemental — it's something older." },
				],
			},
			{
				seasonNumber: 2,
				title: "The Breach",
				description: "The rift is open. Ancient beings pour into the world. Sera must master summoning or watch reality collapse.",
				priceCents: 999,
				episodes: [
					{ title: "Fallout", description: "The rift has stabilized over the capital city. A permanent wound in the sky, raining down creatures from before time." },
					{ title: "The Conclave", description: "Sera meets others with latent summoning ability. Together they might close the rift — or tear it wider." },
					{ title: "Titan War", description: "Sera's summoned titans face the rift creatures in a battle that levels a mountain range." },
					{ title: "The First Summoner", description: "Deep in ancient ruins, Sera finds records of the original summoners and why they chose to let magic die." },
					{ title: "Binding", description: "A forbidden technique can permanently bind a titan to a summoner. The cost is part of their humanity." },
					{ title: "The Dark Titan", description: "The biggest creature yet emerges from the rift. It speaks. It knows Sera's name. It's been waiting." },
					{ title: "Convergence", description: "Every summoner channels their power into Sera for one massive spell. The runes cover her entire body." },
					{ title: "Seal", description: "Sera enters the rift alone. Closing it from the inside means she may never come back." },
				],
			},
		],
	},
	{
		slug: "mock-titan-fall",
		title: "TITAN FALL",
		description: "Colossal bio-mechanical creatures emerge from the deep ocean and lay siege to coastal megacities. Humanity's only defense: the Titan Response Unit, piloting skyscraper-sized war machines in desperate close-quarters combat. Jaw-dropping kaiju-scale destruction with sweeping helicopter tracking shots, visceral street-level chaos, and cockpit close-ups amid titanic collisions.",
		genre: "action",
		creatorIndex: 10,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "Pacific Rim",
				description: "The first wave hits without warning. Five cities. Five titans. Humanity has hours to respond.",
				priceCents: 699,
				episodes: [
					{ title: "Emergence", description: "The Pacific splits open. Something the size of a skyscraper pulls itself onto the shore of Tokyo Bay. The city has 20 minutes." },
					{ title: "Response", description: "The Titan Response Unit deploys their first mech. It's half the creature's size. The pilot has never fought anything real." },
					{ title: "Shanghai", description: "A second creature surfaces in the Huangpu River. This one moves faster. And it brought something with it." },
					{ title: "Cockpit", description: "Inside the mech, everything shakes. Systems fail. The pilot fights by feel as her machine trades blows with a living mountain." },
					{ title: "The Swarm", description: "Smaller creatures pour from a titan's body like parasites. The infantry fights building-to-building while mechs battle above." },
					{ title: "Sydney", description: "A titan makes landfall at the Opera House. The battle destroys the harbor. A pilot makes a sacrifice that saves a million lives." },
					{ title: "The Pattern", description: "Analysts discover the titans aren't random — they're targeting specific locations. Something is buried under every attacked city." },
					{ title: "Deep", description: "A team descends to the ocean trench where the titans originate. What they find at the bottom changes the war." },
				],
			},
		],
	},
	{
		slug: "mock-phantom-circuit",
		title: "Phantom Circuit",
		description: "In a cyberpunk future where AI co-pilots are mandatory, an underground racing league strips the AI out and lets humans drive raw. The fastest circuit in the world — twelve drivers, zero assists, and speeds that kill. Adrenaline-soaked with rapid cuts between holographic HUD shots, bumper-cam inches from asphalt, and sweeping rooftop tracking shots across a neon megacity.",
		genre: "action",
		creatorIndex: 1,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "No Assist",
				description: "Raven joins the Phantom Circuit. The cars are lethal. The drivers are desperate. The prize changes everything.",
				priceCents: 599,
				episodes: [
					{ title: "Override", description: "Raven rips the AI core from her car's engine bay. The dashboard goes dark. From now on, every decision is hers." },
					{ title: "Qualifier", description: "The qualifying race runs through an abandoned elevated highway. Three cars don't finish. The crowd loves it." },
					{ title: "The Grid", description: "Twelve drivers line up on a rooftop starting line. The course drops 40 stories in the first turn." },
					{ title: "Rain Race", description: "A monsoon hits mid-race. Neon reflections on flooded streets. Visibility zero. Raven drives by memory and instinct." },
					{ title: "Tunnel Run", description: "A straight-line sprint through a 3-mile service tunnel. At these speeds, the walls are inches away." },
					{ title: "The Rival", description: "Ghost, the reigning champion, races with a modified AI — not removed, just unchained. His car thinks for itself." },
					{ title: "Death Race", description: "An unsanctioned race through live traffic. Corporate drones try to shut it down. The drivers don't stop." },
					{ title: "Phantom Lap", description: "The championship. A full circuit of the megacity. Raven versus Ghost. No AI. No rules. One finish line." },
				],
			},
		],
	},
	{
		slug: "mock-ashborn",
		title: "Ashborn",
		description: "In a post-apocalyptic wasteland where civilization ended in magical catastrophe, a lone sorcerer walks the ashlands hunting the corrupted mages who broke the world. Each kill restores a fragment of what was lost. Raw post-apocalyptic magic combat with brutal close-ups of spell-work, wide shots of devastated landscapes erupting with power, and visceral tracking shots through ruins.",
		genre: "action",
		creatorIndex: 2,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "The Hunt",
				description: "Seven corrupted mages broke the world. Kaelen will find them all. Each one is worse than the last.",
				priceCents: 599,
				episodes: [
					{ title: "Ashes", description: "Kaelen walks through what used to be a city. The ash is ten feet deep. Something moves beneath it." },
					{ title: "The First", description: "The weakest corrupted mage has built a fortress of bone. Kaelen's fire sigils burn through the walls." },
					{ title: "Aftermath", description: "Killing the mage restores color to a mile of wasteland. Green appears for the first time in decades." },
					{ title: "The Storm Mage", description: "The second target controls weather itself. Kaelen fights through a hurricane made of glass and lightning." },
					{ title: "Shelter", description: "Kaelen finds survivors in an underground bunker. They haven't seen the sky in twenty years. He can't stay." },
					{ title: "Blood Magic", description: "The third mage uses forbidden blood sorcery. The fight is close-quarters, brutal, and costs Kaelen something he can't get back." },
					{ title: "The Rift Walker", description: "A corrupted mage who tears holes in reality. The battle happens across three planes of existence simultaneously." },
					{ title: "The Architect", description: "Kaelen discovers who organized the cataclysm. The seventh mage isn't hiding — they're waiting." },
				],
			},
		],
	},
	{
		slug: "mock-glass-highway",
		title: "Glass Highway",
		description: "A professional getaway driver takes one last job: deliver a witness across three countries in 48 hours with every intelligence agency in Europe in pursuit. Relentless cross-continental supercar escape with aerial salt-flat chases, mountain switchback pursuits, and intimate cockpit tension between driver and passenger.",
		genre: "action",
		creatorIndex: 3,
		isHeroSeries: false,
		seasons: [
			{
				seasonNumber: 1,
				title: "The Last Run",
				description: "2,400 kilometers. 48 hours. Every border is closed. Every road is watched. One car.",
				priceCents: 499,
				episodes: [
					{ title: "Pickup", description: "Maren collects the witness from a bombed-out safe house in Berlin. Three SUVs are already circling the block." },
					{ title: "Autobahn", description: "A 200-mph chase through German highways. No speed limit means no ceiling. The pursuers have helicopters." },
					{ title: "The Alps", description: "Mountain passes with hairpin turns and thousand-foot drops. A convoy blocks the tunnel. Maren goes over the mountain." },
					{ title: "Border", description: "Every crossing is locked down. Maren knows a smuggler's route through a disused rail tunnel. It's not empty." },
					{ title: "Lyon", description: "Urban pursuit through narrow French streets. The witness reveals why every agency wants them dead — and it's bigger than expected." },
					{ title: "Night Drive", description: "Headlights off through the French countryside. Infrared drones overhead. Maren drives by moonlight and memory." },
					{ title: "The Coast", description: "A seaside highway, cliffs on one side, ocean on the other. A blockade ahead. A helicopter behind. One option." },
					{ title: "Delivery", description: "The final 50 kilometers. Every asset in Europe converges. Maren's car is held together by willpower. The finish line isn't a place — it's a broadcast." },
				],
			},
		],
	},
];
