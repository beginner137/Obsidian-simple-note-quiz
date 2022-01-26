import * as React from "react";
import { MarkdownRenderer, TFile } from 'obsidian';
import { Card } from "quiz-modal";
import { correctMark, wrongMark } from "strings";


export function ReactCard(props: { cards: Card[], plugin: any, recordResponse: Function }) {
    const { cards, plugin, recordResponse } = props;
    const [rightAnswerNum, setRightAnswerNum] = React.useState(0);
    const [showAnswer, setShowAnswer] = React.useState<boolean>(false);
    const [currentCardNum, setCurrentCardNum] = React.useState(0);
    const questionContainerRef = React.useRef<HTMLDivElement>(null);
    const answerContainerRef = React.useRef<HTMLDivElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const numOfCards = cards.length;

    // // add class for container
    plugin.modalEl.addClass("quiz__container");

    const renderNextCardCleanUp = (answer: string) => {
        answerContainerRef.current.empty();
        if (answer === 'yes') {
            setRightAnswerNum(x => x + 1);
        }
        cards[currentCardNum].setResponse(answer);
        setCurrentCardNum(old => old + 1);
        setShowAnswer(false);
    }

    const isEnd = () => {
        return currentCardNum >= cards.length;
    }

    // render next card
    React.useEffect(() => {
        if (isEnd()) {
            return;
        }
        questionContainerRef.current.empty();
        MarkdownRenderer.renderMarkdown(cards[currentCardNum].question, questionContainerRef.current, plugin.app.workspace.getActiveFile(), plugin);
        questionContainerRef.current.findAll('.internal-embed').forEach((ele) => {
            renderImages(ele);
        })
    }, [currentCardNum]);

    const renderAnswerArea = () => {
        setShowAnswer(true);
        answerContainerRef.current.empty();
        answerContainerRef.current.focus();
        MarkdownRenderer.renderMarkdown(cards[currentCardNum].answer, answerContainerRef.current, plugin.app.workspace.getActiveFile(), plugin);
        answerContainerRef.current.findAll('.internal-embed').forEach((ele) => {
            renderImages(ele);
        })
    }

    const renderImages = (ele: HTMLElement) => {
        const source = ele.getAttribute("src");
        const imageSource = getImageSource(source);
        if (imageSource) {
            answerContainerRef.current.createEl('img',
                { attr: { src: imageSource } },
                (img) => {
                    img.setAttribute("width", "100%");
                }
            );
            ele.remove();
        }
    }

    const getImageSource = (source: string) => {
        const imageReg = /[\/.](gif|jpg|jpeg|tiff|png)$/i;
        const isImage = !!source && imageReg.test(source);
        if (!isImage) return false;
        const targetFile = plugin.app.metadataCache.getFirstLinkpathDest(source, '');
        if (!targetFile) return false;
        const imageSource = plugin.app.vault.getResourcePath(targetFile);
        if (!imageSource) return false;
        return imageSource;
    }

    const submitResponse = (response: string) => {
        if (response === 'yes') {
            recordResponse(cards);
        } else {
            plugin.close();
        }
    }

    const renderSummary = () => {

        return <div>
            <h3>Nice work👏 ! You got {rightAnswerNum} out of {cards.length} questions right!</h3>
            <h3> Would you like to make the marks?</h3>
            <div className="quiz__container__checkmark__container">
                <button onClick={() => submitResponse('yes')}>Yes</button>
                <button onClick={() => submitResponse('no')}>No</button>
            </div>
        </div>
    }

    const handleCorrectKeyDown = (e) => {
        const keyArrowRight = 39;
        const keyArrowLeft = 37;
        const keyEnter = 13;
        const bindKeys = [keyArrowRight, keyArrowLeft, keyEnter];
        const keyCode = e.keyCode;
        if (!bindKeys.includes(keyCode)) {
            return;
        };
        if (!showAnswer && keyCode === keyEnter) {
            renderAnswerArea();
        }
        if (showAnswer) {
            if (keyCode === keyArrowRight) {
                renderNextCardCleanUp('no');
            }
            if (keyCode === keyArrowLeft) {
                renderNextCardCleanUp('yes');
            }
        }
        if (isEnd()) {
            if (keyCode === keyArrowRight) {
                submitResponse('no');
            }
            if (keyCode === keyArrowLeft) {
                submitResponse('yes');
            }
        }
    }

    React.useEffect(() => {
        window.addEventListener('keydown', handleCorrectKeyDown);
        return () => window.removeEventListener('keydown', handleCorrectKeyDown);
    }, [handleCorrectKeyDown])

    return (
        <div ref={wrapperRef}>
            {isEnd() ? renderSummary() :
                <>
                    <h3>Current progress: {currentCardNum + 1}/{numOfCards}</h3>
                    <div ref={questionContainerRef} />
                    {!showAnswer && <button className="show-answer-btn" onClick={() => renderAnswerArea()}>Show Answer</button>}
                    <div ref={answerContainerRef} tabIndex={-1} />
                    {showAnswer && <div className="quiz__container__checkmark__container">
                        <button onClick={() => renderNextCardCleanUp('yes')}>{`Correct ${correctMark}`}</button>
                        <button onClick={() => renderNextCardCleanUp('no')}>{`Wrong ${wrongMark}`}</button>
                    </div>}
                </>
            }
        </div>
    );
}
