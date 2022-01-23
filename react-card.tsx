import * as React from "react";
import { MarkdownRenderer } from 'obsidian';
import { Card } from "quiz-modal";
import { correctMark, wrongMark } from "strings";

let questionContainer: HTMLElement;
let answerContainer: HTMLElement;
let showAnswerButton: HTMLElement;
let checkmarkContainer: HTMLElement;
let yesButton: HTMLElement;
let noButton: HTMLElement;


export function ReactCard(props: { cards: Card[], app: any, updateCards: Function }) {
    const { cards, app, updateCards } = props;
    const [answerVisibility, setAnswerVisibility] = React.useState('hide');
    const [currentCardNum, setCurrentCardNum] = React.useState(0);
    const numOfCards = cards.length;

    // // add class for container
    app.modalEl.addClass("quiz__container");


    const renderNextCardCleanUp = (answer: string) => {
        setAnswerVisibility('hide');
        setCurrentCardNum(old => {
            cards[old].setResponse(answer);
            return old + 1
        });
        checkmarkContainer.hide();
        answerContainer.empty();
    }

    const isEnd = (): boolean => {
        return currentCardNum >= cards.length;
    }

    // invoke only once
    React.useEffect(() => {
        const containerEl = app.modalEl;
        const controller = new AbortController;

        // create question container
        questionContainer = containerEl.createEl("div", { cls: "quiz__container__question__container" });
        showAnswerButton = containerEl.createEl("button", { text: "Show Answer", cls: "show-answer-btn" });
        showAnswerButton.addEventListener("click", () => {
            setAnswerVisibility('show');
            showAnswerButton.hide();
        }, { signal: controller.signal });
        answerContainer = containerEl.createEl("div", { cls: "quiz__container__answer__container" });
        checkmarkContainer = containerEl.createEl("div", { cls: "quiz__container__checkmark__container" });
        yesButton = checkmarkContainer.createEl("button", { text: `Correct ${correctMark}`, cls: "yes-btn" });
        noButton = checkmarkContainer.createEl("button", { text: `Wrong ${wrongMark}`, cls: "no-btn" });
        checkmarkContainer.hide();

        yesButton.addEventListener("click", () => {
            renderNextCardCleanUp("yes");
        }, { signal: controller.signal });
        noButton.addEventListener("click", () => {
            renderNextCardCleanUp("no");
        }, { signal: controller.signal })

        return () => {
            controller.abort();
        };
    }, []);

    // render next card
    React.useEffect(() => {
        if (isEnd()) {
            updateCards(cards);
            return;
        }
        questionContainer.empty();
        MarkdownRenderer.renderMarkdown(cards[currentCardNum].question, questionContainer, app.app.workspace.getActiveFile(), app);

    }, [currentCardNum]);

    // render answer
    React.useEffect(() => {
        if (answerVisibility === 'hide') {
            showAnswerButton.show();
        } else {
            answerContainer.empty();
            MarkdownRenderer.renderMarkdown(cards[currentCardNum].answer, answerContainer, app.app.workspace.getActiveFile(), app);
            checkmarkContainer.show();
        }
    }, [answerVisibility]);

    return (
        <>
            <h3>Current progress: {currentCardNum + 1}/{numOfCards}</h3>
        </>
    );
}
