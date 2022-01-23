import * as React from "react";
import { MarkdownRenderer } from 'obsidian';
import { Card } from "./quiz-modal";
import { ReactCard } from "./react-card";

let questionContainer: HTMLElement;
let answerContainer: HTMLElement;
let showAnswerButton: HTMLElement;
let checkmarkContainer: HTMLElement;
let yesButton: HTMLElement;
let noButton: HTMLElement;


export function QuizPage(props: { cards: Card[], app: any, recordResponse: Function }) {
    const { cards, app, recordResponse } = props;
    const [isEnd, setIsEnd] = React.useState(false);

    const updateCards = (cards: Card[]) => {
        setIsEnd(true);
        // recordResponse(cards);
    }

    return (
        <>
            {!isEnd && <ReactCard cards={cards} app={app} updateCards={updateCards} />}
            {isEnd && <h1>AHAHAHAH</h1>}
        </>
    );
}
