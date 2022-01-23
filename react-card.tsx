import * as React from "react";
import { MarkdownRenderer } from 'obsidian';
import { Card } from "quiz-modal";
import { correctMark, wrongMark } from "strings";

// let questionContainer: HTMLElement;
let answerContainer: HTMLElement;
let showAnswerButton: HTMLElement;
let checkmarkContainer: HTMLElement;
let yesButton: HTMLElement;
let noButton: HTMLElement;


export function ReactCard(props: { cards: Card[], app: any, recordResponse: Function }) {
    const { cards, app, recordResponse } = props;
    const [rightAnswerNum, setRightAnswerNum] = React.useState(0);
    const [showAnswer, setShowAnswer] = React.useState<boolean>(false);
    const [currentCardNum, setCurrentCardNum] = React.useState(0);
    const questionContainerRef = React.useRef<HTMLDivElement>(null);
    const answerContainerRef = React.useRef<HTMLDivElement>(null);

    const numOfCards = cards.length;

    // // add class for container
    app.modalEl.addClass("quiz__container");


    const renderNextCardCleanUp = (answer: string) => {
        if (answer === 'yes') {
            setRightAnswerNum(x => x + 1);
        }
        cards[currentCardNum].setResponse(answer);
        setCurrentCardNum(old => old + 1);
        setShowAnswer(false);
    }

    const isEnd = (): boolean => {
        return currentCardNum >= cards.length;
    }

    // render next card
    React.useEffect(() => {
        if (isEnd()) {
            return;
        }
        questionContainerRef.current.empty();
        MarkdownRenderer.renderMarkdown(cards[currentCardNum].question, questionContainerRef.current, app.app.workspace.getActiveFile(), app);

    }, [currentCardNum]);

    const renderAnswerArea = () => {
        setShowAnswer(true);
        answerContainerRef.current.empty();
        MarkdownRenderer.renderMarkdown(cards[currentCardNum].answer, answerContainerRef.current, app.app.workspace.getActiveFile(), app);
    }

    const submitResponse = (response: string) => {
        if (response === 'yes') {
            recordResponse(cards);
        } else {
            app.close();
        }
    }

    const renderSummary = () => {
        return <div>
            <h3>Nice work👏 ! You have finished the quiz and scored {rightAnswerNum} out of {cards.length} questions!</h3>
            <h3> Would you like to make the marks?</h3>
            <button onClick={() => submitResponse('yes')}>Yes</button>
            <button onClick={() => submitResponse('no')}>No</button>
        </div>
    }


    return (
        <>
            {isEnd() ? renderSummary() :
                <>
                    <h3>Current progress: {currentCardNum + 1}/{numOfCards}</h3>
                    <div ref={questionContainerRef} />
                    {!showAnswer && <button className="show-answer-btn" onClick={() => renderAnswerArea()}>Show Answer</button>}
                    <div ref={answerContainerRef} />
                    {showAnswer && <div className="quiz__container__checkmark__container">
                        <button onClick={() => renderNextCardCleanUp('yes')}>{`Correct ${correctMark}`}</button>
                        <button onClick={() => renderNextCardCleanUp('no')}>{`Wrong ${wrongMark}`}</button>
                    </div>}
                </>
            }
        </>
    );
}
