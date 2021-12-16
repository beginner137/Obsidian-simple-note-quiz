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

// TODO: fix responses.

export function ReactCard(props: { cards: Card[], app: any, recordResponse: Function }) {
    const { cards, app, recordResponse } = props;
    const [showAnswer, setShowAnswer] = React.useState('hide');
    const [currentCardNum, setCurrentCardNum] = React.useState(0);
    const [lastAnswer, setLastAnswer] = React.useState('');
    const [lineNumbers, setLineNumbers] = React.useState({ responses: [] });

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
        const renderNextCardCleanUp = (answer) => {
            setShowAnswer('hide');
            setLastAnswer(answer);
            setCurrentCardNum(old => old + 1);
            console.log(answer);
            checkmarkContainer.hide();
            answerContainer.empty();
        }
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

    React.useEffect(() => {
        const lineNumber = cards[currentCardNum].lineNumber;
        setLineNumbers(oldState => ({
            responses: [...oldState.responses, { lineNumber: lineNumber, response: lastAnswer }]
        }));
    }, [lastAnswer]);

    React.useEffect(() => {
        if (currentCardNum >= cards.length) {
            recordResponse(lineNumbers);
            app.close();
            return;
        }
        questionContainer.empty();
        MarkdownRenderer.renderMarkdown(cards[currentCardNum].question, questionContainer, app.app.workspace.getActiveFile(), app);

    }, [currentCardNum]);

    React.useEffect(() => {
        if (showAnswer === 'hide') {
            showAnswerButton.show();
        }

        if (showAnswer === 'show') {
            answerContainer.empty();
            MarkdownRenderer.renderMarkdown(cards[currentCardNum].answer, answerContainer, app.app.workspace.getActiveFile(), app);
            checkmarkContainer.show();
        }
    }, [showAnswer]);

    return (
        <>
        </>
    );
}
