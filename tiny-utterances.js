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
    }
    
    const condensedFormatter = new Intl.DateTimeFormat("en-US", {dateStyle: "medium"});
    const fullFormatter = new Intl.DateTimeFormat("en-US", {month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", timeZoneName: "short"});
    
    const humanize = timestamp => {
        const now = new Date().getTime();
        const delta = now - timestamp;
    
        if (delta == 0) {
            return "now";
        } else if (delta == 1) {
            return "one second ago";
        } else if (delta < 60) {
            return `${delta} seconds ago`;
        }
    
        const deltaInMinutes = Math.round(delta / 60);
        
        if (deltaInMinutes == 1) {
            return "one minute ago";
        } else if (deltaInMinutes < 60) {
            return `${deltaInMinutes} minutes ago`;
        }
    
        const deltaInHours = Math.round(deltaInMinutes / 60);
    
        if (deltaInHours == 1) {
            return "one hour ago";
        } else if (deltaInHours < 24) {
            return `${deltaInHours} hours ago`;
        }
    
        return condensedFormatter.format(new Date(timestamp));
    }
    
    const renderComment = comment => {
        const createdAtHumanized = humanize(comment.created_at);
        const createdAtFull = fullFormatter.format(new Date(comment.created_at));
    
        return `<div class="tu-comment">
                    <div class="tu-header">
                        <img class="tu-avatar" src=${comment.user.avatar_url} />
                        <span class="tu-login"><a class="user-mention" href="${comment.user.html_url}">${comment.user.login}</a></span>
                        <span class="tu-created-at" title="${createdAtFull}"><a href="${comment.html_url}">${createdAtHumanized}</a></span>
                    </div>
                    ${comment.body_html}
                </div>`;
    }
    
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
