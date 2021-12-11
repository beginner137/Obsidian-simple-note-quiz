import * as React from "react";
import { App, MarkdownRenderChild, MarkdownRenderer, Modal, Setting, TFile, } from 'obsidian'
import { Card } from "quiz-modal"

let questionContainer: HTMLElement;
let answerContainer: HTMLElement;
let showAnswerButton: HTMLElement;
let checkmarkContainer: HTMLElement;
let yesButton: HTMLElement;
let noButton: HTMLElement;

export function ReactCard(props: { cards: Card[], app: any }) {
    const [yesLines, setYesLines] = React.useState(-1);
    const [noLines, setNoLines] = React.useState(-1);
    const [showAnswer, setShowAnswer] = React.useState('hide');
    const [currentCardNum, setCurrentCardNum] = React.useState(0);
    const [container, setContainer] = React.useState(null);
    const { cards, app } = props;
    // // add class for container
    const containerEl = app.modalEl;
    containerEl.addClass("quiz__container");


    React.useEffect(() => {
        // create question area
        questionContainer = containerEl.createEl("div", { cls: "quiz__container__question__container" });
        showAnswerButton = containerEl.createEl("button", { text: "Show Answer", cls: "show-answer-btn" });
        showAnswerButton.addEventListener("click", () => {
            setShowAnswer('show');
            showAnswerButton.hide();
        });
        answerContainer = containerEl.createEl("div", { cls: "quiz__container__answer__container" });
        checkmarkContainer = containerEl.createEl("div", { cls: "quiz__container__checkmark__container" });
        yesButton = checkmarkContainer.createEl("button", { text: "✅", cls: "yes-btn" });
        noButton = checkmarkContainer.createEl("button", { text: "❌", cls: "no-btn" });
        checkmarkContainer.hide();
        yesButton.addEventListener("click", () => {
            setShowAnswer('hide');
            checkmarkContainer.hide();
        });
    }, [])

    React.useEffect(() => {
        questionContainer.empty();
        MarkdownRenderer.renderMarkdown(cards[0].question, questionContainer, app.app.workspace.getActiveFile(), app);

        if (showAnswer === 'show') {
            answerContainer.empty();
            MarkdownRenderer.renderMarkdown(cards[0].answer, answerContainer, app.app.workspace.getActiveFile(), app);
            checkmarkContainer.show();
        }
    }, [showAnswer]);

    return (
        <>
        </>
    );
}
