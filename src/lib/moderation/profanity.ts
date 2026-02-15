import {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} from "obscenity";

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

const censor = new TextCensor();

export function containsProfanity(text: string): boolean {
	return matcher.hasMatch(text);
}

export function censorText(text: string): string {
	const matches = matcher.getAllMatches(text);
	return censor.applyTo(text, matches);
}
