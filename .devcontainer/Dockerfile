FROM alpine:3.19.1

COPY --from=node:21.6.1-alpine / /
COPY --from=rust:1.76.0-alpine / /

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

# Install required tools and libraries for Rust and setup shell and more tools
RUN \
  --mount=type=cache,target=/usr/local/cargo/registry \
  RUSTFLAGS="-Ctarget-feature=-crt-static" cargo install wasm-bindgen-cli && \
  rustup target add wasm32-unknown-unknown && \
  rustup component add rust-analyzer rustfmt && \
  wget -O - https://rustwasm.github.io/wasm-pack/installer/init.sh | sh && \
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
  echo 'alias rtpsql="psql -h postgres -U rating-tracker"' >> /root/.zshrc && \
  echo -e "\o /dev/null\nSET search_path TO \"rating-tracker\";\n\o" > /root/.psqlrc && \
  wget -O /tmp/rust-analyzer-no-server.vsix https://github.com/rust-lang/rust-analyzer/releases/latest/download/rust-analyzer-no-server.vsix && \
  wget -O - https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
