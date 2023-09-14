/**
 * Application specific interfaces
 */
export interface Config {
    portainer: PortainerCredentials
    stack: StackParams
}

export interface PortainerCredentials {
    url: URL
    username: string
    password: string
    environment_id: number
}

export interface StackParams {
    name: string
    file: string
    delete: boolean
    prune: boolean,
    pull_image: boolean
}

export interface Stack {
    id: number
    name: string
}

export interface CreateStackPayload {
    name: string
    environmentId: number
    file: string
}

export interface UpdateStackPayload {
    id: number
    environmentId: number
    file: string
    prune: boolean,
    pull_image: boolean
}

export interface DeleteStackPayload {
    id: number
    environmentId: number
}

/**
 * Portainer specific interfaces
 */
export interface PortainerStack {
    Id: number
    Name: string
}
