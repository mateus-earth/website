#!/usr/bin/env python3
##~---------------------------------------------------------------------------##
##                        _      _                 _   _                      ##
##                    ___| |_ __| |_ __ ___   __ _| |_| |_                    ##
##                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   ##
##                   \__ \ || (_| | | | | | | (_| | |_| |_                    ##
##                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   ##
##                                                                            ##
##  File      : process.py                                                    ##
##  Project   : stdmatt_blog                                                  ##
##  Date      : Jan 21, 2020                                                  ##
##  License   : GPLv3                                                         ##
##  Author    : stdmatt <stdmatt@pixelwizards.io>                             ##
##  Copyright : stdmatt 2020                                                  ##
##                                                                            ##
##  Description :                                                             ##
##                                                                            ##
##---------------------------------------------------------------------------~##

##----------------------------------------------------------------------------##
## Imports                                                                    ##
##----------------------------------------------------------------------------##
import os;
import os.path;
import argparse;
import sys;
from pathlib import Path;
from mcow_py_termcolor import termcolor;


##----------------------------------------------------------------------------##
## Helper Functions                                                           ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
def canonize_path(path):
    return os.path.abspath(os.path.normpath(os.path.expanduser(path)));

##------------------------------------------------------------------------------
def is_template_line(line):
    line = line.replace("\n", "").strip(" ");
    return line.startswith("{!") and line.endswith("}");

##------------------------------------------------------------------------------
def get_template_filename(line):
    line = line.replace("\n", "").strip(" ");
    return line.replace("{!", "").replace("}", "");

##------------------------------------------------------------------------------
def parse_args(args, flag):
    try:
        index = args.index(flag);
    except:
        log_fatal("Couldn't find flag - {0}", flag);
    if(index + 1 >= len(args)):
        log_fatal("Missing argument for flag - {0}", flag);

    value = args[index + 1];
    args.pop(index);
    args.pop(index); ## Remove the flag and the value.

    return value;

##------------------------------------------------------------------------------
class C:
    def path    (s): return termcolor.colored(s, termcolor.MAGENTA);
    def path_alt(s): return termcolor.colored(s, termcolor.BLUE);

    def num(s): return termcolor.colored(s, termcolor.CYAN   );


##----------------------------------------------------------------------------##
## Entry Point                                                                ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
def main():
    args = sys.argv[1:]
    project_root         = parse_args(args, "--project-root");
    output_directory     = parse_args(args, "--output-dir"  );
    filenames_to_process = args;

    print("Project Root     : ({0})".format(C.path(project_root    )));
    print("Output  Directory: ({0})".format(C.path(output_directory)));
    print("Files to Process : ({0})".format(C.num (len(filenames_to_process))));

    templates           = {};
    templates_directory = canonize_path(
        os.path.join(project_root, "html_templates")
    );

    for i, t_filename in enumerate(filenames_to_process):
        html_filename = t_filename.replace(".t.html", ".html");
        t_fullpath    = canonize_path(os.path.join(project_root,     t_filename   ));
        html_fullpath = canonize_path(os.path.join(output_directory, html_filename));

        print("Processing: ({0})".format(C.path(t_fullpath)));

        ## Read the .t.html lines.
        t_lines = [];
        with open(t_fullpath, "r") as rf:
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
                template_fullpath = os.path.join(
                    templates_directory,
                    template_filename
                );
                with open(template_fullpath, "r") as tf:
                    template_lines = tf.readlines();
                    templates[template_filename] = template_lines;

            for template_line in template_lines:
                html_lines.append(template_line);

        ## Write the .html file ;D
        print("Writting to ({0})".format(C.path_alt(html_fullpath)));
        dir_name = os.path.dirname(html_fullpath);
        os.makedirs(dir_name, exist_ok=True);
        with open(html_fullpath, "w") as wf:
            wf.writelines(html_lines);


if(__name__ == "__main__"):
    main();
