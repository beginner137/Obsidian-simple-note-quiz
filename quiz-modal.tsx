import { App, MarkdownPreviewRenderer, MarkdownRenderChild, MarkdownRenderer, Modal, Setting, TFile } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactCard } from "./react-card";
import { correctMark, wrongMark } from 'const';


export default class QuizModal extends Modal {
    result: string;
    onSubmit: (result: string) => void;
    noteLines: string[];
    file: TFile;

    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    async onOpen() {
        const file = this.app.workspace.getActiveFile();
        const cards = await this.prepareCards(file);
        const recordResponse = (updatedCards: Card[]) => {
            updatedCards.filter(card => !!card.response).forEach(card => {
                if (card.response === 'yes') {
                    this.noteLines[card.lineNumber] = this.noteLines[card.lineNumber].concat(correctMark);
                } else if (card.response === 'no') {
                    this.noteLines[card.lineNumber] = this.noteLines[card.lineNumber].concat(wrongMark);
                }
            });

            let fileText = this.noteLines.join("\n");
            this.app.vault.modify(file, fileText);
        };

        ReactDOM.render(
            <ReactCard cards={cards} app={this} recordResponse={recordResponse} />, this.modalEl
        );
    }

    async prepareCards(note: TFile) {
        let fileText: string = await this.app.vault.read(note);
        const lines = fileText.split("\n");
        const cards = [];
        for (let i = 0; i < lines.length; i++) {
            let answer = "";
            if (lines[i].includes('?')) {
                lines[i] = lines[i].replaceAll(correctMark, '');
                lines[i] = lines[i].replaceAll(wrongMark, '');
                const question = lines[i];
                const lineNumber = i;
                while (i + 1 < lines.length && lines[i + 1].length !== 0) {
                    answer += lines[i + 1] + "\n";
                    i++;
                }
                cards.push(new Card(question, answer, lineNumber));
            }
        }
        this.noteLines = lines;
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
    response: string;

    constructor(question: string, answer: string, lineNumber: number) {
        this.question = question;
        this.answer = answer;
        this.lineNumber = lineNumber;
    }

    setResponse(response: string) {
        this.response = response;
    }
}