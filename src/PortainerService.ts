import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import * as core from '@actions/core';
import {CreateStackPayload, DeleteStackPayload, PortainerStack, Stack, UpdateStackPayload} from "./types";

export class PortainerService {
    accessToken = null;
    private readonly client: AxiosInstance;

    constructor(url: URL) {
        if (!url.pathname.includes('/api/')) {
            url.pathname += '/api/';
        }

        /**
         * Create axios instance for requests.
         */
        this.client = axios.create({
            baseURL: url.toString()
        });

        /**
         * Create Axios Interceptor for Authorization header if token is set.
         */
        this.client.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
            if (this.accessToken) {
                config.headers['Authorization'] = `Bearer ${this.accessToken}`;
            }
            return config;
        });
    }

    /**
     * Authenticate against the Portainer API and store the JWT Token.
     *
     * @param username {String} - admin username,
     * @param password {String} - admin password.
     */
    async authenticate(username: string, password: string) {
        const {data} = await this.client.post('/auth', {
            username,
            password
        });

        this.accessToken = data.jwt;
    }

    /**
     * Retrieve the swarm ID from the Portainer Endpoint.
     *
     * @param environmentId {Number} - Portainer endpoint ID.
     */
    async getSwarmId(environmentId: number): Promise<number> {
        const {data} = await this.client.get(`/endpoints/${environmentId}/docker/swarm`);
        return data.ID;
    }

    /**
     * Retrieve all existing stacks from Docker Swarm.
     *
     * @param environmentId {Number} - Portainer environment ID.
     */
    async getStacks(environmentId: number): Promise<Stack[]> {
        const swarmId = await this.getSwarmId(environmentId);
        core.info("SwarmID=" + swarmId)
        const {data}: { data: PortainerStack[] } = await this.client.get(
            '/stacks',
            {
                params: {
                    filters: JSON.stringify({
                        SwarmID: swarmId
                    })
                }
            });

        return data.map((item) => ({
            id: item.Id,
            name: item.Name
        }));
    }

    /**
     * Create new stack and return name and id.
     *
     * @param payload {CreateStackPayload} - Payload for the stack to be created.
     */
    async createStack(payload: CreateStackPayload): Promise<Stack> {
        const swarmId = await this.getSwarmId(payload.environmentId);
        const {data}: { data: PortainerStack } = await this.client.post(
            '/stacks/create/swarm/string',
            {
                fromAppTemplate: false,
                name: payload.name,
                stackFileContent: payload.file,
                swarmID: swarmId
            },
            {
                params: {
                    endpointId: payload.environmentId
                }
            });

        return {
            id: data.Id,
            name: data.Name
        };
    }

    /**
     * Update existing stack with payload.
     *
     * @param payload {UpdateStackPayload} - Payload for the stack to be updated.
     */
    async updateStack(payload: UpdateStackPayload): Promise<Stack> {
        const {data}: { data: PortainerStack } = await this.client.put(
            `/stacks/${payload.id}`,
            {
                stackFileContent: payload.file,
                prune: payload.prune,
                pullImage: payload.pull_image
            },
            {
                params: {
                    endpointId: payload.environmentId
                }
            });

        return {
            id: data.Id,
            name: data.Name
        };
    }

    /**
     * Delete a stack by the given ID.
     *
     * @param payload {DeleteStackPayload} - ID of the stack to be deleted.
     */
    async deleteStack(payload: DeleteStackPayload): Promise<void> {
        await this.client.delete(
            `/stacks/${payload.id}`,
            {
                params: {
                    external: true,
                    endpointId: payload.environmentId
                }
            }
        );
    }
}
