# Portainer Stack Deployment

Github Action for creating/updating docker swarm stacks using the portainer API. The file can be a ".mustache" file to
allow for workflow specific overrides (e.g. image).

## Usage

Simply include the following lines to your workflow:

```yaml
jobs:
  name: Example
  runs-on: ubuntu-latest
  steps:
    - name: Clone Repository
    - uses: actions/checkout@v2
    - name: Deploy Stack to Portainer
      uses: nevzatcirak/portainer-stack-deployment@v2.19.0
      with:
        url: "https://portainer.example.com"
        username: "admin"
        password: "password"
        environment_id: 1
        stack_name: stack-name
        stack_file_path: path/to/stackfile.yml.mustache # Use .mustache or .yml
        mustache_variables: '{"image": "hello-world"}'
```

## Inputs

The following inputs are available:

| Name                 | Type   | Required | Default | Description                                                                                          |
|----------------------|--------|----------|---------|------------------------------------------------------------------------------------------------------|
| `url`                | URL    | Yes      | -       | URL of The Portainer instance that is including the protocol.                                        |
| `username`           | String | Yes      | -       | Portainer Admin Username.                                                                            |
| `password`           | String | Yes      | -       | Portainer Admin Password.                                                                            |
| `environment_id`     | Number | Yes      | -       | Portainer Environment ID.                                                                            |
| `stack_name`         | String | Yes      | -       | Name of the stack to be deployed or updated.                                                         |
| `stack_file_path`    | String | Yes      | -       | PLocation of the stack file (Relative from the root directory). Can be either `.yml` or `.mustache`. |
| `mustache_variables` | String | No       | {}      | Variables to use when `file` is a `.mustache` template. Variables need to be written as JSON String. |
| `delete`             | String | No       | false   | If set to `true` the stack will be deleted (based on the name).                                      |
| `prune `             | String | No       | false   | If set to `true` missing/obsolete services will be removed from the exiting stack on update.         |
| `pullImage `         | String | No       | false   | If set to `true` existing images will be removed and pull again on update.                           |
