import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Modal from './quiz-modal';
import { questionSeparatorOptions } from './constants';

export interface SimpleNoteQuizPluginSettings {
	questionMarkSetting: string;
	questionSeparatorSetting: string;
}

const DEFAULT_SETTINGS: SimpleNoteQuizPluginSettings = {
	questionMarkSetting: '?',
	questionSeparatorSetting: questionSeparatorOptions.NEW_LINE
}

export default class SimpleNoteQuizPlugin extends Plugin {
	settings: SimpleNoteQuizPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('checkbox-glyph', 'Quiz you note', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Modal(this.app, this.settings).open();
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
		this.addSettingTab(new SimpleNoteQuizPluginSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class SimpleNoteQuizPluginSettingTab extends PluginSettingTab {
	plugin: SimpleNoteQuizPlugin;

	constructor(app: App, plugin: SimpleNoteQuizPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		this.createQuestionMarkSetting(containerEl);
		// containerEl.createEl('h4', { text: 'Settings' });
		this.createQuestionSeparatorDropdownSetting(containerEl);

	}

	createQuestionSeparatorDropdownSetting(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName('Question separator')
			.setDesc('How the plugin separates questions')
			.addDropdown((dropdown) => {
				dropdown
					.addOption(questionSeparatorOptions.NEW_LINE, 'New line')
					.addOption(questionSeparatorOptions.NEW_BULLET_POINT, 'New unindented bullet point')
					.setValue(this.plugin.settings.questionSeparatorSetting)
					.onChange(async (value) => {
						console.log(value);
						this.plugin.settings.questionSeparatorSetting = value;
						await this.plugin.saveSettings();
					});
			});
	}

	createQuestionMarkSetting(containerEl: HTMLElement): void {
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
			});
	}
}
