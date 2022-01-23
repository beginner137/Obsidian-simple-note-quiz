import { App, MarkdownPreviewRenderer, MarkdownRenderChild, MarkdownRenderer, Modal, Setting, SuggestModal, Notice, TFile } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactCard } from "./react-card";
import {
    correctMark,
    wrongMark,
    mode_all_title,
    mode_all_id,
    mode_unMarked_title,
    mode_unMarked_id,
    mode_wrongOnes_title,
    mode_wrongOnes_id,
    mode_clearAll_id,
    mode_clearAll_title
} from 'strings';

interface Mode {
    id: number;
    title: string;
    description: string;
}

const ALL_Modes = [
    {
        id: mode_all_id,
        title: mode_all_title,
        description: "Review all the questions",
    },
    {
        id: mode_unMarked_id,
        title: mode_unMarked_title,
        description: "Only review unmarked questions",
    },
    {
        id: mode_wrongOnes_id,
        title: mode_wrongOnes_title,
        description: "Only review the wrong ones",
    },
    {
        id: mode_clearAll_id,
        title: mode_clearAll_title,
        description: 'This will clear all your previous marks',
    }
];


export default class Suggestions extends SuggestModal<Mode> {
    app: App;

    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.app = app;
    }

    // Returns all available suggestions.
    getSuggestions(query: string): Mode[] {
        return ALL_Modes.filter((mode) =>
            mode.title.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Renders each suggestion item.
    renderSuggestion(mode: Mode, el: HTMLElement) {
        el.createEl("div", { text: mode.title });
        el.createEl("small", { text: mode.description });
    }

    // Perform action on the selected suggestion.
    onChooseSuggestion(mode: Mode, evt: MouseEvent | KeyboardEvent) {
        return new QuizModal(this.app, mode.id).open();
    }
}


class QuizModal extends Modal {
    result: string;
    noteLines: string[];
    file: TFile;
    mode: number;

    constructor(app: App, mode: number) {
        super(app);
        this.mode = mode;
    }

    async onOpen() {
        const lines = await this.processFileText();
        if (!lines) {
            new Notice('Cleared all your previous marks!');
            this.close()
            return;
        }

        const cards = this.prepareCards(lines);

        if (cards.length === 0) {
            new Notice('You have nothing to quiz!');
            this.close();
        } else {
            ReactDOM.render(
                <ReactCard cards={cards} app={this} recordResponse={this.recordResponse} />, this.modalEl
            );
        }
    }

    async processFileText() {
        const file = this.app.workspace.getActiveFile();
        let fileText = await this.app.vault.read(file);
        let lines = fileText.split("\n");
        if (this.mode === mode_clearAll_id) {
            lines = lines.map(x => this.isQuestion(x) ? this.clearMarks(x) : x);
            this.modifyContent(lines, file);
            return false;
        }
        return lines;
    }


    recordResponse = (updatedCards: Card[]) => {
        updatedCards.filter(card => !!card.response).forEach(card => {
            if (card.response === 'yes') {
                this.noteLines[card.lineNumber] = this.noteLines[card.lineNumber].concat(correctMark);
            } else if (card.response === 'no') {
                this.noteLines[card.lineNumber] = this.noteLines[card.lineNumber].concat(wrongMark);
            }
        });
    };


    private prepareCards(lines: string[]) {
        const cards = [];
        for (let i = 0; i < lines.length; i++) {
            let answer = "";
            if (this.isIncluded(lines[i])) {
                lines[i] = this.clearMarks(lines[i]);
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

    private modifyContent(lines: string[], file) {
        let fileText = lines.join("\n");
        this.app.vault.modify(file, fileText);
    }

    private isQuestion(line: string): boolean {
        return line.includes('?');
    }
    private isIncluded(line: string): boolean {
        if (!this.isQuestion(line)) return false;

        if (this.mode === mode_unMarked_id) {
            return !(line.includes(correctMark) || line.includes(wrongMark));
        } else if (this.mode === mode_wrongOnes_id) {
            return line.includes(wrongMark);
        } else {
            return true;
        }
    }

    private clearMarks(questionString: string) {
        return questionString.replaceAll(correctMark, '').replaceAll(wrongMark, '');
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