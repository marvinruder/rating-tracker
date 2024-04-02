FROM alpine:3.19.1

COPY --from=node:21.7.1-alpine / /
COPY --from=rust:1.77.1-alpine / /

ENV PATH="/usr/local/cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ENV CARGO_HOME="/usr/local/cargo"
ENV RUSTUP_HOME="/usr/local/rustup"

RUN \
  --mount=type=cache,target=/var/cache/apk \
  apk add \
  bash \
  binaryen \
  curl \
  docker-cli \
  docker-zsh-completion \
  git \
  gpg \
  gpgsm \
  htop \
  musl-dev \
  nasm \
  openssh \
  openssl-dev \
  pkgconfig \
  postgresql-client \
  zsh \
  zsh-autosuggestions \
  zsh-syntax-highlighting \
  zsh-theme-powerlevel10k \
  zsh-vcs

# Install required tools and libraries for Rust
RUN \
  --mount=type=cache,target=/usr/local/cargo/registry \
  RUSTFLAGS="-Ctarget-feature=-crt-static" cargo install wasm-bindgen-cli && \
  rustup target add wasm32-unknown-unknown && \
  rustup component add rust-analyzer rustfmt && \
  wget -O - https://rustwasm.github.io/wasm-pack/installer/init.sh | sh

# Setup shell and more tools
RUN \
  echo "PS1='\[\e[33m\]\u@\h\[\e[0m\]:\[\e[34m\]\w\[\e[0m\] \$([[ \$? == 0 ]] && echo -e \"\\[\\e[32m\\]\" || echo -e \"\\[\\e[31m\\]\")➜\[\e[0m\] '" >> /etc/profile && \
  echo "alias ls='ls --color=auto'" >> /etc/profile && \
  echo "alias ll='ls -alF'" >> /etc/profile && \
  echo "alias la='ls -A'" >> /etc/profile && \
  echo "alias l='ls -CF'" >> /etc/profile && \
  echo "cat /etc/motd" >> /etc/profile && \
  echo 'autoload -Uz compinit && compinit' >> /etc/zsh/zshrc && \
  mkdir -p /root/.local/share/zsh/plugins && \
  ln -s /usr/share/zsh/plugins/powerlevel10k /root/.local/share/zsh/plugins/ && \
  sed 's/# os_icon/os_icon  /;s/❯/➜/;s/# node_version/node_version  /;s/# package/package  /' /usr/share/zsh/plugins/powerlevel10k/config/p10k-lean.zsh > /root/.p10k.zsh && \
  echo '[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path zsh)"' >> /root/.zshrc && \
  echo '[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh' >> /root/.zshrc && \
  find /usr/share/zsh/plugins/zsh-*/zsh-*.zsh | grep -v .plugin.zsh | sed 's/^/source /' >> /root/.zshrc && \
  echo 'HISTFILE=~/.zsh_history' >> /root/.zshrc && \
  echo 'HISTSIZE=100000' >> /root/.zshrc && \
  echo 'SAVEHIST=100000' >> /root/.zshrc && \
  echo 'setopt SHARE_HISTORY' >> /root/.zshrc && \
  echo 'autoload -Uz up-line-or-beginning-search down-line-or-beginning-search' >> /root/.zshrc && \
  echo 'zle -N up-line-or-beginning-search' >> /root/.zshrc && \
  echo 'zle -N down-line-or-beginning-search' >> /root/.zshrc && \
  echo 'bindkey "^[[A" up-line-or-beginning-search' >> /root/.zshrc && \
  echo 'bindkey "^[[B" down-line-or-beginning-search' >> /root/.zshrc && \
  echo "zstyle ':completion:*' menu select" >> /root/.zshrc && \
  echo "zstyle ':completion:*' rehash true" >> /root/.zshrc && \
  echo "zstyle ':completion:*' list-colors 'di=34:ln=35:so=32:pi=33:ex=31:bd=46;34:cd=43;34:su=41;30:sg=46;30:tw=42;30:ow=43;30'" >> /root/.zshrc && \
  echo 'export CLICOLOR=1' >> /root/.zshrc && \
  echo 'alias rtpsql="psql -h postgres -U rating-tracker"' >> /root/.zshrc && \
  echo -e "\o /dev/null\nSET search_path TO \"rating-tracker\";\n\o" > /root/.psqlrc && \
  wget -O /tmp/rust-analyzer-no-server.vsix https://github.com/rust-lang/rust-analyzer/releases/latest/download/rust-analyzer-no-server.vsix && \
  wget -O - https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
