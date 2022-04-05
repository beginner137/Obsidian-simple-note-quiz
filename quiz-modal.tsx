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
    mode_clearAll_title,
    mode_nothing_id
} from 'strings';
import { SimpleNoteQuizPluginSettings } from 'main';
import { questionSeparatorOptions } from './constants';

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
    settings: SimpleNoteQuizPluginSettings;

    constructor(app: App, settings: SimpleNoteQuizPluginSettings) {
        super(app);
        this.app = app;
        this.settings = settings;
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
        return new QuizModal(this.app, mode.id, this.settings).open();
    }
}


class QuizModal extends Modal {
    noteLines: string[];
    file: TFile;
    mode: number;
    settings: SimpleNoteQuizPluginSettings;


    constructor(app: App, mode: number, settings: SimpleNoteQuizPluginSettings) {
        super(app);
        this.mode = mode;
        this.file = app.workspace.getActiveFile();
        this.settings = settings;
    }

    async onOpen() {
        if (!this.file) {
            this.generateNotice();
            this.close();
            return;
        }
        const lines = await this.processFileText();
        if (!lines) {
            if (this.mode === mode_clearAll_id) {
                this.generateNotice(this.mode);
            } else {
                this.generateNotice();
            }
            this.close()
            return;
        }

        const cards = this.prepareCards(lines);

        if (cards.length === 0) {
            this.generateNotice();
            this.close();
        } else {
            ReactDOM.render(
                <ReactCard cards={cards} plugin={this} recordResponse={this.recordResponse} />, this.modalEl
            );
        }
    }

    async processFileText() {
        let fileText = await this.app.vault.read(this.file);
        let lines = fileText.split("\n");
        if (this.mode === mode_clearAll_id) {
            lines = lines.map(x => this.isQuestion(x) ? this.clearMarks(x) : x);
            this.modifyContent(lines);
            return false;
        }
        return lines;
    }

    private generateNotice(mode: number = mode_nothing_id) {
        if (mode === mode_clearAll_id) {
            return new Notice('Cleared all your previous marks!');
        } else if (mode === mode_nothing_id) {
            return new Notice('You have nothing to quiz!');
        }
        return;
    }

    recordResponse = (updatedCards: Card[]): void => {
        updatedCards.filter(card => !!card.response).forEach(card => {
            if (card.response === 'yes') {
                this.noteLines[card.lineNumber] = this.noteLines[card.lineNumber].concat(correctMark);
            } else if (card.response === 'no') {
                this.noteLines[card.lineNumber] = this.noteLines[card.lineNumber].concat(wrongMark);
            }
        });
        this.modifyContent(this.noteLines);
        this.close();
    };


    private prepareCards(lines: string[]) {
        const cards = [];
        for (let i = 0; i < lines.length; i++) {
            let answer = "";
            if (this.isIncluded(lines[i])) {
                lines[i] = this.clearMarks(lines[i]);
                const question = lines[i];
                const lineNumber = i;
                while (i + 1 < lines.length && !this.isQuestionOver(lines[i + 1])) {
                    answer += lines[i + 1].trim() + "\n";
                    i++;
                }
                cards.push(new Card(question, answer, lineNumber));
            }
        }
        this.noteLines = lines;
        return cards;
    }

    private isQuestionOver(line: string) {
        if (this.settings.questionSeparatorSetting == questionSeparatorOptions.NEW_LINE) {
            return line.length === 0;
        } else {
            return line.startsWith('-');
        }
    }

    private modifyContent(lines: string[]) {
        let fileText = lines.join("\n");
        this.app.vault.modify(this.file, fileText);
    }

    private isQuestion(line: string): boolean {
        return line.includes(this.settings.questionMarkSetting);
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