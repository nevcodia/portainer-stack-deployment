import * as core from '@actions/core';
import * as config from './ActionConfig';
import {PortainerService} from './PortainerService';
import {Config, Stack} from "./types";

const authenticate = async (portainer: PortainerService, cfg: Config) => {
    core.startGroup('Authentication');
    core.info("Authenticating to Portainer API.");
    await portainer.authenticate(cfg.portainer.username, cfg.portainer.password);
    core.info("Authentication token is retrieved.");
    core.endGroup();
}

const retrieveCurrentStack = async (portainer: PortainerService, cfg: Config): Promise<Stack | undefined> => {
    core.startGroup('Retrieving Current Stack');
    const stacks = await portainer.getStacks(cfg.portainer.environment_id);
    const stack = stacks.find(item => item.name === cfg.stack.name);
    if(stack == undefined)
        core.info("Stack(" + cfg.stack.name + ") could not be found.")
    else
        core.info("Stack(" + cfg.stack.name + ") is found.")
    core.endGroup();
    return stack;
}

const deleteCurrentStack = async (portainer: PortainerService, cfg: Config, stack: Stack) => {
    core.startGroup('Stack Delete');
    core.info(`Delete existing stack (ID: ${stack.id})...`);
    await portainer.deleteStack({
        id: stack.id,
        environmentId: cfg.portainer.environment_id
    });
    core.info(`Stack(${stack.id}) is deleted.`);
    core.endGroup();
}

const updateCurrentStack = async (portainer: PortainerService, cfg: Config, stack: Stack) => {
    core.startGroup('Stack Update');
    core.info(`Updating existing stack (ID: ${stack.id}; prune: ${cfg.stack.prune}; pullImage: ${cfg.stack.pullImage};)...`);
    await portainer.updateStack({
        id: stack.id,
        environmentId: cfg.portainer.environment_id,
        file: cfg.stack.file,
        prune: cfg.stack.prune,
        pullImage: cfg.stack.pullImage
    })
    core.info(`Stack(${stack.id}) is updated.`);
    core.endGroup();
}

const createNewStack = async (portainer: PortainerService, cfg: Config) => {
    core.startGroup('Stack Create');
    core.info("Creating new stack...");
    await portainer.createStack({
        environmentId: cfg.portainer.environment_id,
        name: cfg.stack.name,
        file: cfg.stack.file
    })
    core.info(`Stack(${cfg.stack.name}) is created.`);
    core.endGroup();
}

export async function exec() {
    try {
        const cfg = config.get();
        const portainer = new PortainerService(cfg.portainer.url);
        core.debug(`Stack Content: ${cfg.stack.file}`);

        await authenticate(portainer, cfg);
        const stack = await retrieveCurrentStack(portainer, cfg);

        if (!!stack) {
            if (cfg.stack.delete) {
                await deleteCurrentStack(portainer, cfg, stack);
            } else {
                await updateCurrentStack(portainer, cfg, stack);
            }
        } else {
            await createNewStack(portainer, cfg);
        }
    } catch (e) {
        core.setFailed(`Action failed with error: ${e}`);
    }
}
