import { App, PluginSettingTab, Setting } from 'obsidian';
import { questionSeparatorOptions } from './constants';
import SimpleNoteQuizPlugin from 'main';

export interface SimpleNoteQuizPluginSettings {
    questionMarkSetting: string;
    questionSeparatorSetting: string;
    randomizeQuestionSetting: boolean;
}

export const DEFAULT_SETTINGS: SimpleNoteQuizPluginSettings = {
    questionMarkSetting: '?',
    questionSeparatorSetting: questionSeparatorOptions.NEW_LINE,
    randomizeQuestionSetting: false
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
        this.createRandomizeQuestionSetting(containerEl);

    }

    createRandomizeQuestionSetting(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Randomize questions?')
            .setDesc('If toggled, the cards will be displayed in random order')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.randomizeQuestionSetting)
                    .onChange(async (value) => {
                        this.plugin.settings.randomizeQuestionSetting = value;
                        await this.plugin.saveSettings();
                    });

            });
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
