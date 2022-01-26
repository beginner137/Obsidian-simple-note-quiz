import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Modal from './quiz-modal';

export interface MyPluginSettings {
	questionMarkSetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	questionMarkSetting: '?'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('checkmark', 'Quiz you note', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Modal(this.app, this.settings).open();
			console.log(this.settings);
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');


		this.addCommand({
			id: 'quiz-current-note',
			name: 'Start quiz on current note',
			callback: () => {
				new Modal(this.app, this.settings).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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

		containerEl.createEl('h4', { text: 'Configure marks and hotkeys' });

		new Setting(containerEl)
			.setName('Question mark')
			.setDesc('The plugin will recognize lines with the mark as questions')
			.addText(text => text
				.setValue(this.plugin.settings.questionMarkSetting)
				.onChange(async (value) => {
					if (!!value) {
						this.plugin.settings.questionMarkSetting = value;
						await this.plugin.saveSettings();
					}
				}))
			.addExtraButton((button) => {
				button
					.setIcon("reset")
					.setTooltip("Reset default")
					.onClick(async () => {
						this.plugin.settings.questionMarkSetting = DEFAULT_SETTINGS.questionMarkSetting;
						await this.plugin.saveSettings();
						this.display();
					});
			})
	}
}
