FROM ubuntu:22.04 as baseimage


ENV DEBIAN_FRONTEND noninteractive
ENV TZ="Europe/Berlin"

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y curl tmux xz-utils ffmpeg  wget gconf-service libgbm-dev ca-certificates lsb-release xdg-utils python3-pip imagemagick imagemagick-doc git &&\
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && pip3 install install --force-reinstall https://github.com/yt-dlp/yt-dlp/archive/master.tar.gz


ARG S6_OVERLAY_VERSION=3.1.4.1

ENV DBPATH=db
ENV DBPORT=5432
ENV POSTGRES_PASSWORD=example
ENV POSTGRES_USER=testuser
ENV SERVER_PASSWORD=supersecretpassword
ENV YTDL_CMD=yt-dlp
ENV REACT_C_NAME=example.com

CMD ["/app/run.sh"]

EXPOSE 9257

ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz /tmp
RUN tar -C / -Jxpf /tmp/s6-overlay-noarch.tar.xz
ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-x86_64.tar.xz /tmp
RUN tar -C / -Jxpf /tmp/s6-overlay-x86_64.tar.xz
RUN mkdir /app

WORKDIR /app
COPY ./docker/run.sh /app/run.sh
RUN chmod +x /app/run.sh

ENTRYPOINT ["/init"]

FROM elschnagoo/base:latest  as app

COPY ./dist /app/dist
COPY ./res /app/res
COPY ./public /app/public
COPY ./node_modules /app/node_modules
COPY ./package-lock.json /app/
COPY ./package.json /app/
COPY ./tsconfig.json /app/


