#!/usr/bin/env python3

##----------------------------------------------------------------------------##
## Imports                                                                    ##
##----------------------------------------------------------------------------##
import os;
import os.path;
import argparse;
from pathlib import Path;

##----------------------------------------------------------------------------##
## Helper Functions                                                           ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
def canonize_path(path):
    return os.path.abspath(os.path.normpath(os.path.expanduser(path)));

##------------------------------------------------------------------------------
def get_script_dir():
    path = canonize_path(__file__);
    return os.path.dirname(path);

##------------------------------------------------------------------------------
def is_template_line(line):
    line = line.replace("\n", "").strip(" ");
    return line.startswith("{!") and line.endswith("}");

##------------------------------------------------------------------------------
def get_template_filename(line):
    line = line.replace("\n", "").strip(" ");
    return line.replace("{!", "").replace("}", "");


##----------------------------------------------------------------------------##
## Entry Point                                                                ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
def main():
    ##
    ## Parse the command line arguments.
    parser = argparse.ArgumentParser(description="");
    parser.add_argument(
        "--clear",
        dest="should_clear",
        action="store_true",
        help="clear the gerenerated .html files"
    );
    args = parser.parse_args()

    script_dir = get_script_dir();
    start_path = os.path.join(script_dir, "..");
    extension  = "*.t.html";

    templates = {};

    for t_filename in Path(start_path).rglob(extension):
        t_filename = str(t_filename);
        html_filename = t_filename.replace(".t.html", ".html");

        print("Processing: ({0})".format(t_filename));
        if(args.should_clear):
            os.remove(html_filename);
            continue;

        ## Read the .t.html lines.
        t_lines = [];
        with open(t_filename, "r") as rf:
            t_lines = rf.readlines();

        ## Parse each line of the .t.html file
        ## if a template directive is found replace it
        ## by the contents of the given template file.
        html_lines = [];
        for t_line in t_lines:
            if(not is_template_line(t_line)):
                html_lines.append(t_line);
                continue;

            ## Check if we already found the same template before
            ## so we don't wast time opening the same file multiple
            ## tiles, if not read it and cache for future usages.
            template_filename = get_template_filename(t_line);
            template_lines    = templates.get(template_filename);
            if(template_lines is None):
                template_fullpath = os.path.join(script_dir, template_filename);
                with open(template_fullpath, "r") as tf:
                    template_lines = tf.readlines();
                    templates[template_filename] = template_lines;

            for template_line in template_lines:
                html_lines.append(template_line);

        ## Write the .html file ;D
        print("Writting to ({0})".format(html_filename));
        with open(html_filename, "w") as wf:
            wf.writelines(html_lines);


if(__name__ == "__main__"):
    main();
