// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { IHeftActionBaseOptions, HeftActionBase } from './HeftActionBase';
import { IBuildStageStandardParameters, BuildStage, IBuildStageOptions } from '../../stages/BuildStage';
import { CommandLineFlagParameter } from '@rushstack/ts-command-line';
import { ICleanStageOptions, CleanStage } from '../../stages/CleanStage';
import { Logging } from '../../utilities/Logging';

export class StartAction extends HeftActionBase {
  private _buildStandardParameters!: IBuildStageStandardParameters;
  private _cleanFlag!: CommandLineFlagParameter;
  private _storybookFlag!: CommandLineFlagParameter;

  public constructor(heftActionOptions: IHeftActionBaseOptions) {
    super(
      {
        actionName: 'start',
        summary: 'Run the local server for the current project',
        documentation: ''
      },
      heftActionOptions
    );
  }

  public onDefineParameters(): void {
    super.onDefineParameters();

    this._buildStandardParameters = BuildStage.defineStageStandardParameters(this);

    this._cleanFlag = this.defineFlagParameter({
      parameterLongName: '--clean',
      description: 'If specified, clean the package before starting the development server.'
    });

    // TODO: Expose an API for custom CLI parameters similar to HeftSession.registerAction()
    this._storybookFlag = this.defineFlagParameter({
      parameterLongName: '--storybook',
      description:
        '(EXPERIMENTAL) Used by the "@rushstack/heft-storybook-plugin" package to launch Storybook.'
    });
  }

  protected async actionExecuteAsync(): Promise<void> {
    if (this._cleanFlag.value) {
      const cleanStage: CleanStage = this.stages.cleanStage;
      const cleanStageOptions: ICleanStageOptions = {};
      await cleanStage.initializeAsync(cleanStageOptions);

      await Logging.runFunctionWithLoggingBoundsAsync(
        this.terminal,
        'Clean',
        async () => await cleanStage.executeAsync()
      );
    }

    const buildStage: BuildStage = this.stages.buildStage;
    const buildStageOptions: IBuildStageOptions = {
      ...BuildStage.getOptionsFromStandardParameters(this._buildStandardParameters),
      watchMode: true,
      serveMode: true
    };

    await buildStage.initializeAsync(buildStageOptions);
    await buildStage.executeAsync();
  }

  protected async afterExecuteAsync(): Promise<void> {
    await new Promise(() => {
      /* start should never continue */
    });
  }
}
