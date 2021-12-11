import { App, MarkdownRenderer, Modal, Setting, TFile } from 'obsidian';

export default class QuizModal extends Modal {
    result: string;
    onSubmit: (result: string) => void;
    view: HTMLElement;

    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        new Setting(contentEl)
            .setName('test')
            .addText((text) => text.onChange((value) => {
                this.result = value
            }));

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Good")
                    .setCta()
                    .onClick(async () => {
                        // this.close();
                        const file = this.app.workspace.getActiveFile();
                        const test = await this.showNote(file);
                        this.view = contentEl.createDiv("div");
                        console.log(test, 'test markdown');
                        this.view.setAttribute("id", "test-view");
                        MarkdownRenderer.renderMarkdown(test, this.view, file.path, this);

                        // this.containerEl.replaceWith(test);
                        // let fileText = this.app.vault.read(file);
                        // console.log(fileText, 'fileText');
                        const fileCachedData = this.app.metadataCache.getFileCache(file);
                        console.log(fileCachedData);
                    }));

    }

    async showNote(note: TFile) {
        let fileText: string = await this.app.vault.read(note);
        const lines = fileText.split("\n");
        const cards = [];
        for (let i = 0; i < lines.length; i++) {
            let answer = "";
            let line = lines[i];
            if (lines[i].trimEnd().endsWith('?')) {
                const question = lines[i];
                lines[i] += 'yoyoyo';
                while (i + 1 < lines.length && lines[i + 1].length !== 0) {
                    answer += lines[i + 1] + "\n";
                    i++;
                }
                cards.push([question, answer]);
            } else {
                continue;
            }
        }
        fileText = lines.join("\n");
        this.app.vault.modify(note, fileText);
        return cards[0][0];
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}