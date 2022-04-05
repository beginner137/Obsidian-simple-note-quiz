import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Modal from './component/quiz-modal';
import { SimpleNoteQuizPluginSettingTab, SimpleNoteQuizPluginSettings, DEFAULT_SETTINGS } from 'config/settings';


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


