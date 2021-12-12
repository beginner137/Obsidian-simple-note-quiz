import * as React from "react";
import { App, MarkdownRenderChild, MarkdownRenderer, Modal, Setting, TFile, } from 'obsidian'
import { Card } from "quiz-modal"

let questionContainer: HTMLElement;
let answerContainer: HTMLElement;
let showAnswerButton: HTMLElement;
let checkmarkContainer: HTMLElement;
let yesButton: HTMLElement;
let noButton: HTMLElement;
let partialButton: HTMLElement;

export function ReactCard(props: { cards: Card[], app: any }) {
    const { cards, app } = props;

    const [yesLines, setYesLines] = React.useState([]);
    const [noLines, setNoLines] = React.useState([]);
    const [showAnswer, setShowAnswer] = React.useState('hide');
    const [currentCardNum, setCurrentCardNum] = React.useState(0);
    // // add class for container
    app.modalEl.addClass("quiz__container");

    // invoke only once
    React.useEffect(() => {
        const containerEl = app.modalEl;
        const controller = new AbortController;
        // create question container
        questionContainer = containerEl.createEl("div", { cls: "quiz__container__question__container" });
        showAnswerButton = containerEl.createEl("button", { text: "Show Answer", cls: "show-answer-btn" });
        showAnswerButton.addEventListener("click", () => {
            setShowAnswer('show');
            showAnswerButton.hide();
        }, { signal: controller.signal });
        answerContainer = containerEl.createEl("div", { cls: "quiz__container__answer__container" });
        checkmarkContainer = containerEl.createEl("div", { cls: "quiz__container__checkmark__container" });
        yesButton = checkmarkContainer.createEl("button", { text: "✅ Correct", cls: "yes-btn" });
        noButton = checkmarkContainer.createEl("button", { text: "❌ Wrong ", cls: "no-btn" });
        checkmarkContainer.hide();
        const renderNextCardCleanUp = () => {
            setShowAnswer('hide');
            setCurrentCardNum(old => old + 1);
            checkmarkContainer.hide();
            answerContainer.empty();
        }
        yesButton.addEventListener("click", () => {
            setYesLines(old => [...old, cards[currentCardNum].lineNumber]);
            renderNextCardCleanUp();
        }, { signal: controller.signal });
        noButton.addEventListener("click", () => {
            setNoLines(old => [...old, cards[currentCardNum].lineNumber]);
            renderNextCardCleanUp();
        }, { signal: controller.signal })
        return () => {
            controller.abort();
        };
    }, [])

    React.useEffect(() => {
        console.log(cards);
        console.log(yesLines, 'yes');
        console.log(noLines, 'no');
        if (currentCardNum >= cards.length) {
            app.close();
            return;
        }
        questionContainer.empty();
        MarkdownRenderer.renderMarkdown(cards[currentCardNum].question, questionContainer, app.app.workspace.getActiveFile(), app);
        if (showAnswer === 'hide') {
            showAnswerButton.show();
        }

        if (showAnswer === 'show') {
            answerContainer.empty();
            MarkdownRenderer.renderMarkdown(cards[currentCardNum].answer, answerContainer, app.app.workspace.getActiveFile(), app);
            checkmarkContainer.show();
        }
    }, [showAnswer, currentCardNum]);

    return (
        <>
        </>
    );
}
