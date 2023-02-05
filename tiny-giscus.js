const processComments = (
    accessToken, repositoryOwner, repositoryName, discussionNumber, maxNumberOfComments, maxNumberOfReplies,
    commentProcessor
) => {
    fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        mode: "cors",
        body: JSON.stringify({
            query:
                `query {
                    repository(owner: "${repositoryOwner}", name: "${repositoryName}") {
                        discussion(number: ${discussionNumber}) {
                            comments(last: ${maxNumberOfComments}) {
                                nodes {
                                    author {
                                        avatarUrl
                                        login
                                    }
                                    bodyHTML
                                    createdAt
                                    replies(last: ${maxNumberOfReplies}) {
                                        nodes {
                                            author {
                                                avatarUrl
                                                login
                                            }
                                            bodyHTML
                                            createdAt
                                        }
                                    }
                                }
                            }
                        }
                    }
                }`
        })
    }).then(response => response.json())
    .then(response => commentProcessor(response.data.repository.discussion.comments.nodes))
    .catch(console.error);
}

const renderComment = (comment, isReply) => {
    const className = "tg-comment" + (isReply ? " tg-reply" : "");
    const createdAt = new Date(comment.createdAt).toLocaleString(undefined, {dateStyle: "long", timeStyle:"medium"});

    return `<div class="${className}">
                <div class="tg-header">
                    <img class="tg-avatar" src=${comment.author.avatarUrl} />
                    <span class="tg-login">${comment.author.login}</span>
                    <span class="tg-created-at">${createdAt}</span>
                </div>
                ${comment.bodyHTML}
            </div>`;
}

const renderThread = (comment) => {
    const renderedComment = renderComment(comment, false);
    const renderedReplies = comment.replies.nodes.map(reply => renderComment(reply, true)).join("");

    return `<div class="tg-thread">${renderedComment}${renderedReplies}</div>`;
}

const renderButton = (noComments, repoName, repoOwner, discussionNumber) => {
    const text = noComments ? "Be the first to comment on GitHub" : "Join the discussion on GitHub";
    const url = `https://github.com/${repoOwner}/${repoName}/discussions/${discussionNumber}`;

    return `<a class="tg-button" href="${url}">${text}</a>`;
}

var elements = document.querySelectorAll(".tiny-giscus");
elements.forEach(element => {
    const dataset = element.dataset;
    const repoOwner = dataset.repoOwner;
    const repoName = dataset.repoName;
    const discussionNumber = Number(dataset.discussionNumber);
    processComments(
        dataset.accessToken, repoOwner, repoName, discussionNumber,
        Number(dataset.maxComments), Number(dataset.maxReplies), comments => {
            const renderedThreads = comments.map(renderThread).join("");
            const renderedJoinButton = renderButton(comments.length == 0, repoName, repoOwner, discussionNumber);
            element.innerHTML = renderedThreads + renderedJoinButton;
        }
    );
});