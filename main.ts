import { App, Editor, MarkdownRenderChild, MarkdownRenderer, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			console.log('Hello you!');
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app, (result) => {
					new Notice(`Hello, ${result}!`);
				}).open();
			}
		});

		this.addCommand({
			id: 'test-file',
			name: 'test file',
			callback: () => {
				new SampleModal(this.app, (result) => {
					new Notice(`Hello, ${result}!`);
				}).open();
			}
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getDoc());
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					// if (!checking) {
					// 	new SampleModal(this.app).open();
					// }

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		const item = this.addStatusBarItem();
		item.createEl("span", { text: "Hello from the status bar 👋" });
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			// console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
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
		return cards[0][1];
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class Markdown extends MarkdownRenderChild {
	text: string;

	constructor(containerEl: HTMLElement, text: string) {
		super(containerEl);
		this.text = text;
	}

	onload() {
		const emojiEl = this.containerEl.createSpan({
			text: this.text
		});
		this.containerEl.replaceWith(emojiEl);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
