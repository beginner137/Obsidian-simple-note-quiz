import { App, PluginSettingTab, Setting } from 'obsidian';
import { questionSeparatorOptions } from './constants';
import SimpleNoteQuizPlugin from 'main';

export interface SimpleNoteQuizPluginSettings {
    questionMarkSetting: string;
    questionSeparatorSetting: string;
}

export const DEFAULT_SETTINGS: SimpleNoteQuizPluginSettings = {
    questionMarkSetting: '?',
    questionSeparatorSetting: questionSeparatorOptions.NEW_LINE
}

export class SimpleNoteQuizPluginSettingTab extends PluginSettingTab {
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
