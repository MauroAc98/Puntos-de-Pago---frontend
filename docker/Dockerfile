ARG node_version 

FROM node:${node_version}

#RUN apk update && apk add nano lsof

COPY ./src /src
WORKDIR /src
RUN npm i --force
RUN npm run build

CMD ["npm", "run", "start"]

# ENTRYPOINT [ "sh", "/entrypoint.sh" ]