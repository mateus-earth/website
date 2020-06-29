#!/usr/bin/env python3

import os;
import os.path;
##from mcow_core import *;


def mcow_canonize_path(*args):
    joined = os.path.join(*args);
    return os.path.abspath(os.path.expanduser(joined));

def mcow_get_script_dir():
    return os.path.dirname(mcow_canonize_path(".", __file__));

def mcow_read_all_file(path):
    with open(path, "r") as f:
        return "".join(f.readlines());

def mcow_write_all_file(path, text):
    with open(path, "w") as f:
        f.write(text);

def mcow_join_lines(sep, *lines):
    return sep.join(lines);

def mcow_join_with_newlines(*lines):
    return "\n".join(lines);


SCRIPT_DIR         = mcow_get_script_dir();
ROOT_DIR           = mcow_canonize_path(SCRIPT_DIR, "..");
BLOG_DIR           = mcow_canonize_path(SCRIPT_DIR, "../blog");
HTML_TEMPLATES_DIR = mcow_canonize_path(SCRIPT_DIR, "../html_templates");

MONTHS = [
    "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"
];

HEADER_TEMPLATE = "{!page_start.template.html}\n{!menu.template.html}";
FOOTER_TEMPLATE = "{!page_end.template.html}"

blog_posts = {};

def main():
    ##
    ## Clean previous templates
    for template in os.listdir(BLOG_DIR):
        if(template.endswith(".md")):
            continue;

        os.remove(mcow_canonize_path(BLOG_DIR, template));

    ##
    ## Process the Blog Entries
    md_entries = os.listdir(BLOG_DIR);
    for md_entry in md_entries:
        if(not md_entry.endswith(".md")):
            continue;

        md_entry_filename = os.path.join(BLOG_DIR, md_entry);
        html_filename     = md_entry_filename.replace(".md", ".html");
        template_filename = md_entry_filename.replace(".md", ".t.html");

        md_entry_name   = md_entry.replace(".md", "");
        components      = md_entry_name.split("-");
        date_components = components[0:3];
        name_components = components[3:]

        day   = date_components[0];
        month = date_components[1].lower();
        year  = date_components[2];

        entry_title = " ".join(name_components);

        if(year not in blog_posts.keys()):
            blog_posts[year] = {};

        if(month not in blog_posts[year].keys()):
            blog_posts[year][month] = {};

        if(day not in blog_posts[year][month].keys()):
            blog_posts[year][month][day] = [];

        blog_posts[year][month][day].append({
            "title":    entry_title,
            "filename": os.path.join("blog", os.path.basename(html_filename))
        });

        ##
        ## Process the markdown
        ##   Write into the template filename that we gonna read
        ##   again to insert the title, doing that so we don't need
        ##   to create an extra file that will needed to be cleaned
        ##   later.
        os.system("markdown {0} > {1}".format(
            md_entry_filename,
            template_filename
        ));

        blog_text  = mcow_read_all_file(template_filename);
        title_text = "<h1>" + entry_title + "</h2>";
        date_text  = "{0} {1}, {2}".format(month.capitalize(), day, year);

        final_text = mcow_join_with_newlines(
            HEADER_TEMPLATE,
            title_text,
            date_text,
            blog_text,
            FOOTER_TEMPLATE
        );

        mcow_write_all_file(template_filename, final_text);


    ##
    ## Create the Blog index page.
    html_text = "";
    for year in sorted(blog_posts.keys()):
        html_text += "<b>" + year + "<b>" + "\n";
        html_text += "<ul>" + "\n";

        for month in MONTHS:
            if(month not in blog_posts[year].keys()):
                continue;

            ## XXX(stdmatt): Make a nice way to reverse the keys..
            days = [];
            for d in blog_posts[year][month].keys():
                days.append(d);
            days.sort();

            for day in reversed(days):
                for entry in blog_posts[year][month][day]:
                    title    = entry["title"];
                    filename = entry["filename"];

                    html_text += "<li><a href=\"{4}\">{0} {1}, {2} - {3}</a></li>\n".format(
                        month.capitalize(), day, year,
                        title, filename
                    );

        html_text += "</ul>\n";

    final_text = mcow_join_with_newlines(
        HEADER_TEMPLATE,
        "<title>Blog</title>\n<hr>",
        html_text,
        FOOTER_TEMPLATE
    );

    blog_index_filename = mcow_canonize_path(ROOT_DIR, "blog.t.html");
    mcow_write_all_file(blog_index_filename, final_text);


main();
