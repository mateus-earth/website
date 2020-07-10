// @XXX - Temporary code, the most sloppy thing that I had written in my
//        life, just to check the concepts. This will break in so many
//        ways that I'll not bother to describe.
//        I should rewrite this soon as possible - stdmatt - Jun 10, 2020

//----------------------------------------------------------------------------//
// Vars                                                                       //
//----------------------------------------------------------------------------//
let tags_list = [];
let all_posts = [];
let selected_tag_li = null;


//----------------------------------------------------------------------------//
// Functions                                                                  //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function
add_post_to_list(tag, post)
{
   if(!tags_list[tag]) {
       tags_list[tag] = [];
   }
   tags_list[tag].push(post);
}

//------------------------------------------------------------------------------
function
select_tag(tag, tag_li)
{
    // Same stuff don't need to do nothing...
    if(tag_li == select_tag) {
        return;
    }


    if(selected_tag_li) {
        selected_tag_li.style.fontWeight     = "normal";
        selected_tag_li.style.textDecoration = "none";
    }

    selected_tag_li = tag_li;
    selected_tag_li.style.textDecoration = "underline";
    selected_tag_li.style.fontWeight     = "bold";

    const lc = document.getElementById("left_col");
    lc.innerHTML = "";

    const append_month = (month) => {
        const div = document.createElement("div");
        div.innerText = "[" + month + "]";
        lc.appendChild(div);
    }

    const keys = Object.keys(tags_list);
    const list = tags_list[tag];

    append_month(list[0]["month"]);
    for(let i = 0; i < list.length; ++i) {
        const item      = list[i];
        const next_item = (i + 1 < list.length) ? list[i+1] : null;

        const li = document.createElement("li");
        const a  = document.createElement("a");
        a.href = item["url"];
        a.text = item["year"] + "-" + item["month"] + "-" + item["day"] + " : " + item["title"];

        li.appendChild(a);
        lc.appendChild(li);

        if(next_item && item["month"] != next_item["month"]) {
            const br = document.createElement("br");
            lc.append(br);
            append_month(next_item["month"]);
        }
    }
}


//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
window.onload = function(e) {
    const rc = document.getElementById("right_col");
    BLOG_ITEMS_FROM_PY_SCRIPT.sort((a, b)=> {
        return b.timestamp - a.timestamp;
    });

    // Build the tags list
    for(let i = 0; i < BLOG_ITEMS_FROM_PY_SCRIPT.length; ++i) {
        const post = BLOG_ITEMS_FROM_PY_SCRIPT[i];
        add_post_to_list("_all", post);

        if(post.tags.length == 0) {
            add_post_to_list("no-tags", post);
            continue;
        }

        for(let j = 0; j < post.tags.length; ++j) {
            const tag = post.tags[j];
            add_post_to_list(tag, post);
        }
    }
    tags_list.sort();

    // Build the tags html...
    const keys = Object.keys(tags_list);
    for(let i = 0; i < keys.length; ++i) {
        const li = document.createElement("li");
        li.innerHTML = keys[i] + "(" + tags_list[keys[i]].length + ")";
        li.onclick = function() {
            select_tag(keys[i], this);
        }
        rc.appendChild(li);

        if(keys[i] == "_all") {
            select_tag(keys[i], li);
        }
    }
}
