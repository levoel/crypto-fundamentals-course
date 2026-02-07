# Crypto Fundamentals Lab - JupyterLab Environment
# Extends official Jupyter image with cryptography libraries

ARG JUPYTER_TAG=2025-12-31
FROM quay.io/jupyter/scipy-notebook:${JUPYTER_TAG}

LABEL maintainer="Crypto Fundamentals Course"
LABEL description="JupyterLab environment for cryptography exercises"

# Install crypto Python packages as user (not root)
COPY --chown=${NB_UID}:${NB_GID} requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Set working directory to mounted notebooks volume
WORKDIR /home/jovyan/work

# Expose JupyterLab port
EXPOSE 8888

# Default command - no auth for local development
CMD ["start-notebook.sh", "--NotebookApp.token=''", "--NotebookApp.password=''"]
