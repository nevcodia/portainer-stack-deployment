import * as core from '@actions/core';
import * as fs from 'fs';
import mustache from 'mustache';
import {Config, PortainerCredentials, StackParams} from "./types";

const getPortainerCredentials = (): PortainerCredentials => {
    return {
        url: new URL(core.getInput('url', {required: true})),
        username: core.getInput('username', {required: true}),
        password: core.getInput('password', {required: true}),
        environment_id: parseInt(core.getInput('environment_id', {required: true}))
    };
}

const getStackParams = (): StackParams => {
    core.info("Getting stack parameters...");
    const filePath = core.getInput('stack_file_path', {required: true});
    let file = fs.readFileSync(filePath, 'utf-8');

    if (filePath.split('.').pop() === 'mustache') {
        core.info("Mustache file is rendering...");
        mustache.escape = JSON.stringify;
        let mustacheVariables = core.getInput('mustache_variables', {required: false});
        if (mustacheVariables == null) {
            core.setFailed("mustache_variables is not defined!")
        } else
            file = mustache.render(file, JSON.parse(mustacheVariables));
    }

    return {
        name: core.getInput('stack_name', {required: true}),
        file,
        delete: core.getInput('delete', {required: false}) === "true",
        prune: core.getInput('prune', {required: false}) === "true",
        pullImage: core.getInput('pullImage', {required: false}) === "true"
    };
}

export const get = (): Config => {
    return {
        portainer: getPortainerCredentials(),
        stack: getStackParams()
    };
}
