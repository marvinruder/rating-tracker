FROM alpine:3.18.4

COPY --from=node:21.1.0-alpine / /
COPY --from=rust:1.73.0-alpine / /

ENV PATH="/usr/local/cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ENV CARGO_HOME="/usr/local/cargo"
ENV RUSTUP_HOME="/usr/local/rustup"

RUN \
  --mount=type=cache,target=/var/cache/apk \
  apk add \
  docker-cli \
  docker-zsh-completion \
  git \
  gpg \
  gpgsm \
  htop \
  openssh \
  zsh \
  zsh-autosuggestions \
  zsh-syntax-highlighting \
  zsh-theme-powerlevel10k

# Install required tools and libraries for Rust
RUN \
  --mount=type=cache,target=/var/cache/apk \
  --mount=type=cache,target=/usr/local/cargo/registry \
  apk add binaryen pkgconfig musl-dev openssl-dev && \
  RUSTFLAGS="-Ctarget-feature=-crt-static" cargo install wasm-bindgen-cli && \
  rustup target add wasm32-unknown-unknown && \
  wget -O - https://rustwasm.github.io/wasm-pack/installer/init.sh | sh

# Setup shell
RUN \
  echo "PS1='\[\e[33m\]\u@\h\[\e[0m\]:\[\e[34m\]\w\[\e[0m\] \$([[ \$? == 0 ]] && echo -e \"\\[\\e[32m\\]\" || echo -e \"\\[\\e[31m\\]\")➜\[\e[0m\] '" >> /etc/profile && \
  echo "alias ls='ls --color=auto'" >> /etc/profile && \
  echo "alias ll='ls -alF'" >> /etc/profile && \
  echo "alias la='ls -A'" >> /etc/profile && \
  echo "alias l='ls -CF'" >> /etc/profile && \
  echo 'autoload -Uz compinit && compinit' >> /etc/zsh/zshrc && \
  mkdir -p /root/.local/share/zsh/plugins && \
  ln -s /usr/share/zsh/plugins/powerlevel10k /root/.local/share/zsh/plugins/ && \
  cat /usr/share/zsh/plugins/powerlevel10k/config/p10k-lean.zsh | sed 's/# os_icon/os_icon  /;s/❯/➜/' > /root/.p10k.zsh && \
  echo '[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path zsh)"' >> /root/.zshrc && \
  echo '[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh' >> /root/.zshrc && \
  find /usr/share/zsh/plugins/zsh-*/zsh-*.zsh | grep -v .plugin.zsh | sed 's/^/source /' >> /root/.zshrc
