FROM mhart/alpine-node

WORKDIR /src

# Build things that take the most time
ADD package.json package.json
ADD yarn.lock yarn.lock
RUN yarn

# Add the rest of our code
ADD . .

CMD ["npm", "start"]
