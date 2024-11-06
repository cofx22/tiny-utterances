(() => {
    const fetchComments = async (
        repositoryOwner, repositoryName, issueNumber, maxNumberOfComments
    ) => {
        const response = await fetch(
            `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/issues/${issueNumber}/comments` +
            `?per_page=${maxNumberOfComments}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/vnd.github.html+json"
                }
            }
        );
    
        if (response.status == 200) {
            return response.json();
        }
    
        throw new Error("Unexpected status: " + response.status);
    };
    
    const condensedFormatter = new Intl.DateTimeFormat("en-US", {dateStyle: "medium"});
    const fullFormatter = new Intl.DateTimeFormat("en-US", {month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", timeZoneName: "short"});
    
    const renderAbsoluteCommentedOn = (timestamp, url) =>
        `commented on <a href="${url}">${timestamp}</a>`;

    const renderRelativeCommentedOn = (timestamp, url) =>
        `commented <a href="${url}">${timestamp}</a>`;

    const renderCommentedOn = (timestamp, url) => {
        const now = new Date().getTime();
        const delta = Math.round((now - timestamp.getTime()) / 1000);
    
        if (delta == 0) {
            return renderRelativeCommentedOn("now", url);
        } else if (delta == 1) {
            return renderRelativeCommentedOn("one second ago", url);
        } else if (delta < 60) {
            return renderRelativeCommentedOn(`${delta} seconds ago`, url);
        }
    
        const deltaInMinutes = Math.round(delta / 60);
        
        if (deltaInMinutes == 1) {
            return renderRelativeCommentedOn("one minute ago", url);
        } else if (deltaInMinutes < 60) {
            return renderRelativeCommentedOn(`${deltaInMinutes} minutes ago`, url);
        }
    
        const deltaInHours = Math.round(deltaInMinutes / 60);
    
        if (deltaInHours == 1) {
            return renderRelativeCommentedOn("one hour ago", url);
        } else if (deltaInHours < 24) {
            return renderRelativeCommentedOn(`${deltaInHours} hours ago`, url);
        }
    
        return renderAbsoluteCommentedOn(condensedFormatter.format(new Date(timestamp)), url);
    };
    
    const renderComment = comment => {
        const timestamp = new Date(comment.created_at)
        const commentedOn = renderCommentedOn(timestamp, comment.html_url);
        const createdAtFull = fullFormatter.format(timestamp);
    
        return `<div class="tu-comment">
                    <div class="tu-header">
                        <a href="${comment.user.html_url}"><img class="tu-avatar" src=${comment.user.avatar_url} /></a>
                        <span class="tu-login"><a href="${comment.user.html_url}">${comment.user.login}</a>&nbsp;</span>
                        <span class="tu-created-at" title="${createdAtFull}">${commentedOn}</span>
                    </div>
                    ${comment.body_html}
                </div>`;
    };
    
    const renderButton = (noComments, repoName, repoOwner, issueNumber) => {
        const text = noComments ? "Be the first to comment on GitHub" : "Join the discussion on GitHub";
        const url = `https://github.com/${repoOwner}/${repoName}/issues/${issueNumber}#issuecomment-new`;
    
        return `<a class="tu-button" href="${url}">${text}</a>`;
    }
    
    var elements = document.querySelectorAll(".tiny-utterances");
    elements.forEach(element => {
        const dataset = element.dataset;
        const repoOwner = dataset.repoOwner;
        const repoName = dataset.repoName;
        const issueNumber = Number(dataset.issueNumber);
        fetchComments(repoOwner, repoName, issueNumber, Number(dataset.maxComments)).then(comments => {
            const renderedComments = comments.map(renderComment).join("");
            const renderedJoinButton = renderButton(comments.length == 0, repoName, repoOwner, issueNumber);
            element.innerHTML = renderedComments + renderedJoinButton;
        }).catch(console.error);
    });    
})();
