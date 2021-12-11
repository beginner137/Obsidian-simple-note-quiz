import { App, MarkdownPreviewRenderer, MarkdownRenderChild, MarkdownRenderer, Modal, Setting, TFile } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactCard } from "./react-card";

export default class QuizModal extends Modal {
    result: string;
    onSubmit: (result: string) => void;
    lines: string[];

    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    async onOpen() {
        const file = this.app.workspace.getActiveFile();
        const cards = await this.prepareCards(file);
        ReactDOM.render(
            <ReactCard cards={cards} app={this} />, this.modalEl
        );

        // const numOfCards = cards.length;
        // this.currentCardNum = 0;

        // checkmarkContainer.style.display = 'none';
        // const card: Card = cards[this.currentCardNum];
        // MarkdownRenderer.renderMarkdown(card.question, questionContainer, file.path, this);

        // showAnswerButton.addEventListener("click", () => {
        //     MarkdownRenderer.renderMarkdown(card.answer, answerContainer, file.path, this);
        //     checkmarkContainer.style.display = 'flex';
        // });

        // yesButton.addEventListener("click", () => {
        //     this.currentCardNum++;
        //     if (this.currentCardNum >= numOfCards) {
        //         this.close();
        //     } else {
        //         this.currentCard = cards[this.currentCardNum];
        //     }
        // });
        // questionContainer.innerHTML = card.question;

        // new Setting(containerEl)
        //     .setName('test')
        //     .addText((text) => text.onChange((value) => {
        //         this.result = value
        //     }));

        // new Setting(containerEl)
        //     .addButton((btn) =>
        //         btn
        //             .setButtonText("Good")
        //             .setCta()
        //             .onClick(async () => {
        //                 // this.close();
        //                 const file = this.app.workspace.getActiveFile();
        //                 const test = await this.showNote(file);
        //                 this.view = containerEl.createDiv("div");
        //                 console.log(test, 'test markdown');
        //                 this.view.setAttribute("id", "test-view");
        //                 MarkdownRenderer.renderMarkdown(test, this.view, file.path, this);

        //                 // this.containerEl.replaceWith(test);
        //                 // let fileText = this.app.vault.read(file);
        //                 // console.log(fileText, 'fileText');
        //                 const fileCachedData = this.app.metadataCache.getFileCache(file);
        //                 console.log(fileCachedData);
        //             }));

    }

    async prepareCards(note: TFile) {
        let fileText: string = await this.app.vault.read(note);
        const lines = fileText.split("\n");
        this.lines = lines;
        const cards = [];
        for (let i = 0; i < this.lines.length; i++) {
            let answer = "";
            if (this.lines[i].includes('?')) {
                const question = lines[i];
                const lineNumber = i;
                while (i + 1 < lines.length && lines[i + 1].length !== 0) {
                    answer += lines[i + 1] + "\n";
                    i++;
                }
                cards.push(new Card(question, answer, lineNumber));
            } else {
                continue;
            }
        }
        return cards;
    }


    onClose() {
        const { contentEl } = this;
        ReactDOM.unmountComponentAtNode(contentEl);
        contentEl.empty();
    }
}

export class Card {
    question: string;
    answer: string;
    lineNumber: number;

    constructor(question: string, answer: string, lineNumber: number) {
        this.question = question;
        this.answer = answer;
        this.lineNumber = lineNumber;
    }
}